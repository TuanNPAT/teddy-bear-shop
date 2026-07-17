package com.example.teddybearshop.mapper;

import com.example.teddybearshop.dto.request.ProductUpdateRequest;
import com.example.teddybearshop.dto.response.ProductResponse;
import com.example.teddybearshop.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    ProductResponse toResponse(Product product);

    void updateProductFromRequest(ProductUpdateRequest request, @MappingTarget Product product);

}