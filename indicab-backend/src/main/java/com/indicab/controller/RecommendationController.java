package com.indicab.controller;

import com.indicab.entity.Recommendation;
import com.indicab.repository.RecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {


    @Autowired
    private RecommendationRepository recommendationRepository;

    @GetMapping("")
    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recommendation> getRecommendationById(@PathVariable Long id) {
        Optional<Recommendation> recommendation = recommendationRepository.findById(id);
        return recommendation.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Recommendation createRecommendation(@RequestBody Recommendation recommendation) {
        return recommendationRepository.save(recommendation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recommendation> updateRecommendation(@PathVariable Long id, @RequestBody Recommendation recommendationDetails) {
        Optional<Recommendation> optionalRecommendation = recommendationRepository.findById(id);
        if (!optionalRecommendation.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Recommendation recommendation = optionalRecommendation.get();
        recommendation.setTitle(recommendationDetails.getTitle());
        recommendation.setLocation(recommendationDetails.getLocation());
        recommendation.setPrice(recommendationDetails.getPrice());
        recommendation.setRating(recommendationDetails.getRating());
        recommendation.setReviews(recommendationDetails.getReviews());
        recommendation.setImage(recommendationDetails.getImage());

        Recommendation updatedRecommendation = recommendationRepository.save(recommendation);
        return ResponseEntity.ok(updatedRecommendation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable Long id) {
        if (!recommendationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        recommendationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
