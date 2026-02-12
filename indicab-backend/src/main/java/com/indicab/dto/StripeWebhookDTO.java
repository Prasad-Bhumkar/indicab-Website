package com.indicab.dto;

import java.util.Map;

/**
 * DTO for handling Stripe webhook events
 */
public class StripeWebhookDTO {
    private String id;
    private String type;
    private Map<String, Object> data;

    public StripeWebhookDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
