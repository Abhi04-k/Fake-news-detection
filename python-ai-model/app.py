import pandas as pd
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
import os
import requests as http_requests
from bs4 import BeautifulSoup
app = Flask(__name__)

# Load dataset and train model on startup
print("Loading dataset and training AI model...")
dataset_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
try:
    df = pd.read_csv(dataset_path)
    
    # Create an NLP pipeline with TF-IDF Vectorization and Logistic Regression Classifier
    model = make_pipeline(TfidfVectorizer(stop_words='english', max_df=0.7), LogisticRegression(random_state=42))
    
    # Train the model with the dataset
    model.fit(df['text'], df['label'])
    print("AI Model trained successfully on local dataset!")
except Exception as e:
    print(f"Error loading dataset: {e}")
    model = None

import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import re

def verify_with_google_news(text):
    # Simple keyword extraction: words longer than 4 characters
    words = re.findall(r'\b[a-zA-Z]{5,}\b', text.lower())
    
    # Grab up to 5 keywords to form a solid search phrase
    keywords = ' '.join(words[:5])
    if not keywords:
        keywords = text[:30] # fallback
        
    query = urllib.parse.quote(keywords)
    url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
    
    try:
        # Create request with a standard browser User Agent
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            items = root.findall('.//item')
            return len(items)
    except Exception as e:
        print(f"Google News verification failed: {e}")
        return -1

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'AI Model failed to initialize'}), 500
        
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text'].strip()
    original_url = text if re.match(r'^https?://[^\s]+$', text) else None
    
    # List of trusted news domains
    trusted_domains = ['thehindu.com', 'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com',
                       'ndtv.com', 'hindustantimes.com', 'indiatoday.in', 'indianexpress.com',
                       'theguardian.com', 'nytimes.com', 'washingtonpost.com', 'aljazeera.com',
                       'timesofindia.indiatimes.com', 'livemint.com', 'news18.com', 'cnbc.com',
                       'cnn.com', 'economictimes.indiatimes.com', 'theprint.in', 'thewire.in', 'scroll.in']
    
    is_trusted_source = False
    if original_url:
        for domain in trusted_domains:
            if domain in original_url.lower():
                is_trusted_source = True
                break
    
    try:
        
        # If the input is exactly a URL, try to scrape it
        if re.match(r'^https?://[^\s]+$', text):
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                }
                req = http_requests.get(text, headers=headers, timeout=15)
                req.raise_for_status()
                soup = BeautifulSoup(req.text, 'html.parser')
                
                # Strip out script and style elements
                for script in soup(["script", "style", "nav", "header", "footer", "aside", "iframe", "noscript"]):
                    script.decompose()

                # Try to find the main article container
                article_container = soup.find('article') or soup.find('main')
                if not article_container:
                    for class_name in ['post-content', 'entry-content', 'article-body', 'content', 'story-body', 'articleBody']:
                        article_container = soup.find(class_=re.compile(class_name, re.I))
                        if article_container: break
                
                # If we found a specific container, extract just from that. Otherwise use whole page.
                target_soup = article_container if article_container else soup
                
                # Strategy 1: Extract text from paragraph tags
                paragraphs = target_soup.find_all('p')
                extracted = " ".join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 15])
                
                # Strategy 2: If no paragraphs, try div tags with substantial text
                if not extracted or len(extracted) < 50:
                    divs = target_soup.find_all('div')
                    texts = [d.get_text().strip() for d in divs if len(d.get_text().strip()) > 50 and not d.find('div')]
                    extracted = " ".join(texts[:10]) if texts else extracted
                
                # Strategy 3: Last resort - get all visible body text  
                if not extracted or len(extracted) < 50:
                    body = soup.find('body')
                    if body:
                        extracted = body.get_text(separator=' ', strip=True)
                        # Trim to first 5000 chars to avoid overwhelming the model
                        extracted = extracted[:5000]

                if not extracted or len(extracted) < 20:
                    return jsonify({'error': 'Could not accurately identify the main article content on that page.'}), 400
                
                text = extracted
            except Exception as e:
                return jsonify({'error': f"Failed to read from URL: {str(e)}"}), 400

        # Check if text is too short or not a proper sentence
        word_count = len(re.findall(r'\w+', text))
        if word_count < 8:
            return jsonify({
                'prediction': 'Unverifiable / Not News',
                'confidence': '0.00',
                'source': 'The text provided is too short or lacks enough context to be verified as a news article.',
                'sentence_breakdown': []
            })

        # Split text into sentences for line-by-line mixed reading
        raw_sentences = re.split(r'(?<=[.!?])\s+', text)
        sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 5]
        
        if not sentences:
            sentences = [text] # Fallback if no punctuation is found
            
        sentence_results = []
        total_fake_score = 0
        total_real_score = 0
        total_google_articles = 0
        
        classes = list(model.classes_)
        fake_idx = classes.index('Fake')
        real_idx = classes.index('Real')
        
        # Analyze each sentence independently
        for sentence in sentences:
            sentence_probs = model.predict_proba([sentence])[0]
            
            # Sub-sentence Google Verification 
            sentence_article_count = verify_with_google_news(sentence)
            if sentence_article_count > 0:
                total_google_articles += sentence_article_count
            
            # Penalize sentences with zero Google results
            if sentence_article_count == 0:
                sentence_probs[fake_idx] += 0.4
                sentence_probs[real_idx] -= 0.4
            # Reward sentences that ARE found on Google News
            elif sentence_article_count >= 20:
                sentence_probs[real_idx] += 0.5
                sentence_probs[fake_idx] -= 0.5
            elif sentence_article_count >= 10:
                sentence_probs[real_idx] += 0.35
                sentence_probs[fake_idx] -= 0.35
            elif sentence_article_count >= 3:
                sentence_probs[real_idx] += 0.2
                sentence_probs[fake_idx] -= 0.2
            
            # Apply trusted source boost
            if is_trusted_source:
                sentence_probs[real_idx] += 0.3
                sentence_probs[fake_idx] -= 0.3
                
            # Normalize
            sentence_probs = [max(0.01, min(0.99, p)) for p in sentence_probs]
            total_sub = sum(sentence_probs)
            sentence_probs = [p / total_sub for p in sentence_probs]
            
            s_max_idx = sentence_probs.index(max(sentence_probs))
            s_pred = classes[s_max_idx]
            s_conf = sentence_probs[s_max_idx] * 100
            
            sentence_results.append({
                'text': sentence,
                'prediction': s_pred,
                'confidence': f"{s_conf:.2f}"
            })
            
            if s_pred == 'Fake':
                total_fake_score += s_conf
            else:
                total_real_score += s_conf

        # Overall Paragraph Logic
        if total_fake_score > total_real_score:
            overall_prediction = 'Fake'
            overall_confidence = total_fake_score / (total_fake_score + total_real_score) * 100
        elif total_real_score > total_fake_score:
            overall_prediction = 'Real'
            overall_confidence = total_real_score / (total_fake_score + total_real_score) * 100
        else:
            overall_prediction = 'Mixed / Neutral'
            overall_confidence = 50.0
            
        source_str = f"Analyzed {len(sentences)} individual claims."
        if total_google_articles > 0:
            source_str += f" Verified via Google News ({total_google_articles} total related articles found)."
        else:
            source_str += " No corroborating sources found on Google News."

        return jsonify({
            'prediction': overall_prediction,
            'confidence': f"{overall_confidence:.2f}",
            'source': source_str,
            'sentence_breakdown': sentence_results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting AI service on port 5001...")
    app.run(port=5001, debug=False)
