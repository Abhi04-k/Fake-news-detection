package com.fakenews.repository;

import com.fakenews.model.NewsHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsHistoryRepository extends JpaRepository<NewsHistory, Long> {
    List<NewsHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByUserId(Long userId);
}
