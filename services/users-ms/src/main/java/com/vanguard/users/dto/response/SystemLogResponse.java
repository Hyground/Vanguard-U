package com.vanguard.users.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SystemLogResponse {
    private Integer id;
    private String username;
    private String action;
    private LocalDateTime logDate;
}
