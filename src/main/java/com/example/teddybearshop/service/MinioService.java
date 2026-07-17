package com.example.teddybearshop.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MinioService {

    List<String> uploadFiles(List<MultipartFile> files);

    void deleteFile(String objectName);

    void deleteFiles(List<String> objectNames);

    String extractObjectNameFromUrl(String url);
}