package com.example.teddybearshop.service;

import com.example.teddybearshop.model.User;

public interface UserContextService {

    String getCurrentUsername();

    Long getCurrentUserId();

    User getCurrentUser();
}