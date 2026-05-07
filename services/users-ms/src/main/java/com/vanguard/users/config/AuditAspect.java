package com.vanguard.users.config;

import com.vanguard.users.model.SystemLog;
import com.vanguard.users.model.User;
import com.vanguard.users.repository.SystemLogRepository;
import com.vanguard.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final SystemLogRepository systemLogRepository;
    private final UserRepository userRepository;

    @AfterReturning(pointcut = "execution(* com.vanguard.users.service.*.*(..))", returning = "result")
    public void logServiceAction(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        String authName = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";

        if (!"anonymousUser".equals(authName)) {
            userRepository.findByUsername(authName).ifPresent(user -> {
                SystemLog log = SystemLog.builder()
                        .user(user)
                        .action("Executed " + className + "." + methodName)
                        .build();
                systemLogRepository.save(log);
            });
        }
    }
}
