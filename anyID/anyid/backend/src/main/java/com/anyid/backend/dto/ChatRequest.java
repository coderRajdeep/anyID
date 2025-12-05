package com.anyid.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private String message;
    private String initialDescription;
    // We might need to pass history or context, but for now let's keep it simple
    // The frontend sends the current message and maybe the context
}
