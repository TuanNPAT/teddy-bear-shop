package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.service.MinioService;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucketName;

    @Override
    public List<String> uploadFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return urls;
        }

        try {
            boolean bucketExists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            if (!bucketExists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
            }

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }

                String originalName = file.getOriginalFilename();
                String extension = "";

                if (originalName != null && originalName.contains(".")) {
                    extension = originalName.substring(originalName.lastIndexOf("."));
                }

                String objectName = UUID.randomUUID() + extension;

                try (InputStream inputStream = file.getInputStream()) {
                    minioClient.putObject(
                            PutObjectArgs.builder()
                                    .bucket(bucketName)
                                    .object(objectName)
                                    .stream(inputStream, file.getSize(), -1)
                                    .contentType(file.getContentType())
                                    .build()
                    );
                }

                String url = minioClient.getPresignedObjectUrl(
                        GetPresignedObjectUrlArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .method(Method.GET)
                                .build()
                );

                urls.add(url);
            }

            return urls;

        } catch (Exception e) {
            log.error("Upload file failed: ", e);
            throw new AppException(ErrorCode.UPLOAD_FILE_FAILED);
        }
    }

    @Override
    public void deleteFile(String objectName) {
        try {
            if (objectName == null || objectName.isEmpty()) {
                return;
            }

            // Kiểm tra file tồn tại trước khi xóa
            try {
                minioClient.statObject(
                        StatObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .build()
                );
            } catch (Exception e) {
                log.warn("File not found: {}", objectName);
                return;
            }

            // Xóa file
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );

            log.info("Deleted file: {}", objectName);

        } catch (Exception e) {
            log.error("Delete file failed: ", e);
            throw new AppException(ErrorCode.DELETE_FILE_FAILED);
        }
    }

    @Override
    public void deleteFiles(List<String> objectNames) {
        if (objectNames == null || objectNames.isEmpty()) {
            return;
        }

        for (String objectName : objectNames) {
            deleteFile(objectName);
        }
    }

    @Override
    public String extractObjectNameFromUrl(String url) {
        try {
            if (url == null || url.isEmpty()) {
                return null;
            }

            // Lấy path từ URL
            // Ví dụ: http://localhost:9000/bucket-name/abc-123.jpg
            // → /bucket-name/abc-123.jpg
            String path = new URL(url).getPath();

            // Lấy phần cuối cùng sau dấu "/"
            // → abc-123.jpg
            String[] parts = path.split("/");
            return parts[parts.length - 1];

        } catch (Exception e) {
            log.error("Extract object name failed for URL: {}", url, e);
            return null;
        }
    }
}