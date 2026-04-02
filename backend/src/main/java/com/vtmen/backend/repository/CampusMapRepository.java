package com.vtmen.backend.repository;

import com.vtmen.backend.model.CampusMapModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampusMapRepository extends MongoRepository<CampusMapModel, String> {
}
