const API_BASE = '/api';

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const msgEl = document.getElementById('msg');
    
    if (password !== confirmPassword) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Passwords do not match.';
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('verifyEmail', email); // Save email for next step
            window.location.href = '/verify.html';
        } else {
            const errorMsg = data.error || 'Registration failed';
            msgEl.className = 'msg error';
            if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('exists')) {
                msgEl.innerText = errorMsg + ' Redirecting to login...';
                setTimeout(() => { window.location.href = '/login.html'; }, 2000);
            } else {
                msgEl.innerText = errorMsg;
            }
        }
    } catch (e) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Network error';
    }
}

async function handleVerify(event) {
    event.preventDefault();
    const email = localStorage.getItem('verifyEmail');
    const otp = document.getElementById('otp').value;
    const msgEl = document.getElementById('msg');
    
    if (!email) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Email not found. Please register again.';
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.removeItem('verifyEmail');
            window.location.href = '/login.html?verified=true';
        } else {
            msgEl.className = 'msg error';
            msgEl.innerText = data.error || 'Verification failed';
        }
    } catch (e) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Network error';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgEl = document.getElementById('msg');
    
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = '/dashboard.html';
        } else {
            const errorMsg = data.error || 'Login failed';
            msgEl.className = 'msg error';
            if (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no account') || errorMsg.toLowerCase().includes('not exist')) {
                msgEl.innerText = errorMsg + ' Redirecting to Create Account...';
                setTimeout(() => { window.location.href = '/register.html'; }, 2000);
            } else {
                msgEl.innerText = errorMsg;
            }
        }
    } catch (e) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Network error';
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const msgEl = document.getElementById('msg');
    
    msgEl.className = 'msg';
    msgEl.innerText = 'Requesting...';
    
    try {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        
        if (res.ok) {
            sessionStorage.setItem('resetEmail', email);
            window.location.href = '/reset-password.html';
        } else {
            msgEl.className = 'msg error';
            msgEl.innerText = data.error || 'Request failed';
        }
    } catch (e) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Network error';
    }
}

async function handleResetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const otp = document.getElementById('otp').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const msgEl = document.getElementById('msg');
    
    if (newPassword !== confirmNewPassword) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Passwords do not match.';
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await res.json();
        
        if (res.ok) {
            sessionStorage.removeItem('resetEmail');
            window.location.href = '/login.html?reset=true';
        } else {
            msgEl.className = 'msg error';
            msgEl.innerText = data.error || 'Reset failed';
        }
    } catch (e) {
        msgEl.className = 'msg error';
        msgEl.innerText = 'Network error';
    }
}

let lastCheckedText = "";
let lastResult = null;

async function handleDetect(event) {
    event.preventDefault();
    const text = document.getElementById('newsText').value;
    const msgEl = document.getElementById('msg');
    const loadingEl = document.getElementById('loadingIndicator');
    const errorEl = document.getElementById('errorContainer');
    const errorDescEl = document.getElementById('errorDescription');
    
    if (!text) return;
    
    // Check if the current text is the same as the last checked text
    if (text === lastCheckedText && lastResult) {
        sessionStorage.setItem('detectionResult', JSON.stringify(lastResult));
        window.location.href = '/result.html';
        return;
    }
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (msgEl) {
        msgEl.className = 'msg';
        msgEl.innerText = '';
    }
    
    try {
        const payload = { text };
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const userId = user.id || user.user_id;
            if (userId) payload.userId = userId;
        }

        const res = await fetch(`${API_BASE}/news/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (loadingEl) loadingEl.style.display = 'none';
        
        if (res.ok) {
            // Save successful result for caching
            lastCheckedText = text;
            lastResult = data;
            
            sessionStorage.setItem('detectionResult', JSON.stringify(data));
            window.location.href = '/result.html';
            
        } else {
            if (errorEl && errorDescEl) {
                errorEl.style.display = 'block';
                errorDescEl.innerText = data.error || 'Server rejected the request. Please try again.';
            } else if (msgEl) {
                msgEl.className = 'msg error';
                msgEl.innerText = data.error || 'Detection failed';
            }
        }
    } catch (e) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl && errorDescEl) {
            errorEl.style.display = 'block';
            errorDescEl.innerText = 'Unable to reach the AI servers. Please check your internet connection and verify the backend is running.';
        } else if (msgEl) {
            msgEl.className = 'msg error';
            msgEl.innerText = 'Network error';
        }
    }
}

function renderResultPage() {
    const dataStr = sessionStorage.getItem('detectionResult');
    if (!dataStr) {
        window.location.href = '/detect.html';
        return;
    }
    
    const data = JSON.parse(dataStr);
    const resultCard = document.getElementById('resultCard');
    
    if (!resultCard) return; // Verify we are on the result page
    
    const isFake = data.prediction.toLowerCase().includes('fake');
    const isMixed = data.prediction.toLowerCase().includes('mixed');
    const isUnverifiable = data.prediction.toLowerCase().includes('unverifiable');
    
    if (isFake) {
        resultCard.className = `result-card fake`;
    } else if (isMixed) {
        resultCard.className = `result-card`;
        resultCard.style.backgroundColor = '#FDF6B2';
        resultCard.style.color = '#723B13';
        resultCard.style.border = '1px solid #FACA15';
    } else if (isUnverifiable) {
        resultCard.className = `result-card`;
        resultCard.style.backgroundColor = '#F3F4F6';
        resultCard.style.color = '#4B5563';
        resultCard.style.border = '1px solid #D1D5DB';
    } else {
        resultCard.className = `result-card real`;
    }

    document.getElementById('resultTitle').innerText = `${data.prediction}`;
    document.getElementById('resultConfidence').innerText = `Confidence: ${data.confidence}%`;
    
    const sourceEl = document.getElementById('resultSource');
    if (sourceEl) sourceEl.innerText = data.source || '';
    
    // Render sentence breakdown
    const breakdownContainer = document.getElementById('breakdownContainer');
    const fakeList = document.getElementById('fakeBreakdownList');
    const realList = document.getElementById('realBreakdownList');
    
    if (data.sentence_breakdown && data.sentence_breakdown.length > 0) {
        breakdownContainer.style.display = 'block';
        fakeList.innerHTML = '';
        realList.innerHTML = '';
        
        data.sentence_breakdown.forEach((sentence) => {
            const item = document.createElement('div');
            item.style.padding = '0.75rem';
            item.style.borderRadius = '6px';
            item.style.backgroundColor = '#ffffff';
            item.style.borderLeft = `4px solid ${sentence.prediction === 'Fake' ? '#EF4444' : '#22C55E'}`;
            item.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            
            item.innerHTML = `
                <p style="margin-bottom: 0.5rem; font-size: 0.875rem;">"${sentence.text}"</p>
                <div style="font-size: 0.75rem; text-align: right;">
                    <span style="color: #6B7280">${sentence.confidence}% Confidence</span>
                </div>
            `;
            
            if (sentence.prediction === 'Fake') {
                fakeList.appendChild(item);
            } else {
                realList.appendChild(item);
            }
        });
        
        if (fakeList.children.length === 0) fakeList.innerHTML = '<p style="color: #6B7280; font-size: 0.875rem;">No fake claims detected.</p>';
        if (realList.children.length === 0) realList.innerHTML = '<p style="color: #6B7280; font-size: 0.875rem;">No verified claims found.</p>';
        
    } else {
        breakdownContainer.style.display = 'none';
    }
}

function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login.html';
    } else {
        const userData = JSON.parse(userStr);
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.innerText = userData.name;
        
        const userId = userData.id || userData.user_id;
        if (window.location.pathname.includes('history')) {
            if (userId) {
                loadUserHistory(userId);
            } else {
                logout(); // Session corrupted, force re-login
            }
        }
    }
}

async function loadUserHistory(userId) {
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    if (!historySection || !historyList) return;
    
    try {
        const res = await fetch(`${API_BASE}/news/history/${userId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                historySection.style.display = 'block';
                historyList.innerHTML = '';
                
                data.forEach(item => {
                    const isFake = item.prediction === 'Fake';
                    const isMixed = item.prediction.includes('Mixed');
                    const color = isFake ? 'var(--danger)' : (isMixed ? '#D97706' : 'var(--secondary)');
                    const bgColor = isFake ? '#FEF2F2' : (isMixed ? '#FEF3C7' : '#F0FDF4');
                    const borderCol = isFake ? '#FCA5A5' : (isMixed ? '#FCD34D' : '#86EFAC');
                    
                    const el = document.createElement('div');
                    el.style.padding = '1rem';
                    el.style.borderRadius = '8px';
                    el.style.backgroundColor = bgColor;
                    el.style.border = `1px solid ${borderCol}`;
                    el.style.position = 'relative';
                    
                    const textSnippet = item.text.length > 150 ? item.text.substring(0, 150) + '...' : item.text;
                    const dateStr = new Date(item.createdAt).toLocaleString();
                    
                    const innerContent = document.createElement('div');
                    innerContent.innerHTML = `
                        <button onclick="deleteHistoryItem(${item.id})" style="position: absolute; top: 1rem; right: 1rem; background: transparent; color: #9CA3AF; border: none; cursor: pointer; font-size: 1.25rem;">&times;</button>
                        <div style="margin-bottom: 0.5rem; display: flex; gap: 1rem; align-items: center;">
                            <span style="font-weight: 700; color: ${color}; font-size: 1.125rem;">${item.prediction}</span>
                            <span style="font-size: 0.875rem; color: #4B5563;">Confidence: ${item.confidence}%</span>
                            <span style="font-size: 0.75rem; color: #9CA3AF; margin-left: auto; padding-right: 2rem;">${dateStr}</span>
                        </div>
                        <p style="font-size: 0.875rem; color: #374151; margin-bottom: 0.5rem; white-space: pre-wrap;">"${textSnippet}"</p>
                        <div style="font-size: 0.75rem; color: #6B7280; font-style: italic; margin-bottom: 0.5rem;">
                            ${item.source ? item.source : ''}
                        </div>
                    `;
                    el.appendChild(innerContent);
                    
                    const viewBtn = document.createElement('button');
                    viewBtn.innerText = 'View Full Analysis';
                    viewBtn.style.cssText = 'background: white; color: var(--primary); border: 1px solid var(--primary); padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s ease;';
                    viewBtn.onmouseover = () => { viewBtn.style.background = 'var(--primary)'; viewBtn.style.color = 'white'; };
                    viewBtn.onmouseout = () => { viewBtn.style.background = 'white'; viewBtn.style.color = 'var(--primary)'; };
                    viewBtn.onclick = () => {
                        const resultObj = {
                            prediction: item.prediction,
                            confidence: item.confidence,
                            source: item.source || '',
                            sentence_breakdown: item.sentenceBreakdown ? JSON.parse(item.sentenceBreakdown) : []
                        };
                        sessionStorage.setItem('detectionResult', JSON.stringify(resultObj));
                        window.location.href = '/result.html';
                    };
                    
                    el.appendChild(viewBtn);
                    historyList.appendChild(el);
                });
            } else {
                historySection.style.display = 'block';
                historyList.innerHTML = '<p style="color: #6B7280;">No detection history yet. Try checking some news!</p>';
            }
        }
    } catch (e) {
        console.error("Failed to load history", e);
    }
}

async function deleteHistoryItem(id) {
    if (!confirm('Are you sure you want to delete this history item?')) return;
    try {
        const res = await fetch(`${API_BASE}/news/history/${id}`, { method: 'DELETE' });
        if (res.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.id) loadUserHistory(user.id);
        }
    } catch (e) {
        console.error('Delete failed', e);
    }
}

async function clearAllHistory() {
    if (!confirm('Are you sure you want to delete ALL your history? This cannot be undone.')) return;
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return;
    
    try {
        const res = await fetch(`${API_BASE}/news/history/all/${user.id}`, { method: 'DELETE' });
        if (res.ok) {
            loadUserHistory(user.id);
        }
    } catch (e) {
        console.error('Clear all failed', e);
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Attach events
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) verifyForm.addEventListener('submit', handleVerify);

    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) resetPasswordForm.addEventListener('submit', handleResetPassword);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('verified') === 'true') {
            const msgEl = document.getElementById('msg');
            msgEl.className = 'msg success';
            msgEl.innerText = 'Account verified! You can now login.';
        }
        if (urlParams.get('reset') === 'true') {
            const msgEl = document.getElementById('msg');
            msgEl.className = 'msg success';
            msgEl.innerText = 'Password reset successfully! You can now login.';
        }
    }

    const detectForm = document.getElementById('detectForm');
    if (detectForm) detectForm.addEventListener('submit', handleDetect);

    // If on a protected page
    if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('detect') || window.location.pathname.includes('history') || window.location.pathname.includes('result')) {
        checkAuth();
    }
});
