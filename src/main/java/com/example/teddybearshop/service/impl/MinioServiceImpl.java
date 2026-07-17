package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.service.MinioService;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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
                                    .stream(
                                            inputStream,
                                            file.getSize(),
                                            -1
                                    )
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
            throw new AppException(ErrorCode.UPLOAD_FILE_FAILED);
        }
    }
}