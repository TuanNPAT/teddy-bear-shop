package com.example.teddybearshop.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
@Slf4j
public class VNPayUtil {

    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "other";

    public Map<String, String> buildPaymentParams(
            String tmnCode,
            String orderCode,
            String amount,
            String returnUrl,
            String ipAddress,
            String bankCode
    ) {

        Map<String, String> params = new TreeMap<>();

        params.put("vnp_Version", VERSION);
        params.put("vnp_Command", COMMAND);
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", amount);
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderCode);
        params.put("vnp_OrderInfo", "Thanh toan don hang: " + orderCode);
        params.put("vnp_OrderType", ORDER_TYPE);
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", getCurrentDateTime());

        if (bankCode != null && !bankCode.isBlank()) {
            params.put("vnp_BankCode", bankCode);
        }

        return params;
    }

    public String createPaymentUrl(
            Map<String, String> params,
            String payUrl,
            String hashSecret
    ) {

        try {

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            Iterator<Map.Entry<String, String>> iterator = params.entrySet().iterator();

            while (iterator.hasNext()) {

                Map.Entry<String, String> entry = iterator.next();

                String fieldName = entry.getKey();
                String fieldValue = entry.getValue();

                if (fieldValue != null && !fieldValue.isEmpty()) {

                    hashData.append(fieldName)
                            .append("=")
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                            .append("=")
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                    if (iterator.hasNext()) {
                        hashData.append("&");
                        query.append("&");
                    }
                }
            }

            String secureHash = hmacSHA512(hashSecret, hashData.toString());

            log.info("HashData: {}", hashData);
            log.info("SecureHash: {}", secureHash);

            return payUrl
                    + "?"
                    + query
                    + "&vnp_SecureHash="
                    + secureHash;

        } catch (Exception ex) {
            throw new RuntimeException("Cannot create VNPay url", ex);
        }

    }

    public boolean verifySignature(
            Map<String, String> params,
            String hashSecret
    ) {

        String receivedHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        Map<String, String> sorted = new TreeMap<>(params);

        StringBuilder hashData = new StringBuilder();

        Iterator<Map.Entry<String, String>> iterator = sorted.entrySet().iterator();

        while (iterator.hasNext()) {

            Map.Entry<String, String> entry = iterator.next();

            if (entry.getValue() != null && !entry.getValue().isEmpty()) {

                hashData.append(entry.getKey())
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));

                if (iterator.hasNext()) {
                    hashData.append("&");
                }
            }
        }

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());

        return calculatedHash.equalsIgnoreCase(receivedHash);
    }

    public String hmacSHA512(String key, String data) {

        try {

            Mac mac = Mac.getInstance("HmacSHA512");

            SecretKeySpec secretKeySpec =
                    new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");

            mac.init(secretKeySpec);

            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();

            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }

            return hash.toString();

        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }

    }

    public String getCurrentDateTime() {

        return new SimpleDateFormat("yyyyMMddHHmmss")
                .format(new Date());

    }

    public String getIpAddress(HttpServletRequest request) {

        String ip =
                request.getHeader("X-Forwarded-For");

        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }

        return ip;
    }

    public String getResponseCode(String responseCode) {
        Map<String, String> responseMap = new HashMap<>();

        responseMap.put("00", "Giao dịch thành công");
        responseMap.put("07", "Trừ tiền thành công - Giao dịch bị nghi ngờ");
        responseMap.put("09", "Thẻ/Tài khoản chưa đăng ký Internet Banking");
        responseMap.put("10", "Xác thực thông tin thẻ không đúng");
        responseMap.put("11", "Đã hết hạn chờ thanh toán");
        responseMap.put("12", "Thẻ/Tài khoản bị khóa");
        responseMap.put("13", "Sai mật khẩu OTP");
        responseMap.put("24", "Khách hàng hủy giao dịch");
        responseMap.put("51", "Tài khoản không đủ số dư");
        responseMap.put("65", "Tài khoản vượt hạn mức giao dịch");
        responseMap.put("75", "Ngân hàng thanh toán đang bảo trì");
        responseMap.put("79", "Nhập sai mật khẩu thanh toán quá số lần quy định");
        responseMap.put("99", "Lỗi không xác định");

        return responseMap.getOrDefault(responseCode, "Giao dịch thất bại");
    }

}