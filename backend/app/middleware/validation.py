from fastapi import Request, HTTPException, status
import re
from typing import Any

class InputValidator:
    """Validate and sanitize user inputs"""
    
    @staticmethod
    def sanitize_string(value: str) -> str:
        """Remove potentially dangerous characters"""
        # Remove null bytes
        value = value.replace('\x00', '')
        # Remove control characters except newline and tab
        value = re.sub(r'[\x01-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', value)
        return value.strip()
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format"""
        # Remove common separators
        phone = re.sub(r'[\s\-\(\)]', '', phone)
        # Check if it's digits with optional + prefix
        return bool(re.match(r'^\+?\d{10,15}$', phone))
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username format"""
        # Alphanumeric, underscore, hyphen, 3-30 characters
        return bool(re.match(r'^[a-zA-Z0-9_-]{3,30}$', username))
    
    @staticmethod
    def detect_sql_injection(value: str) -> bool:
        """Detect potential SQL injection attempts"""
        sql_patterns = [
            r"('\s*(or|and)\s*')",  # ' or ', ' and '
            r"(--)",                 # SQL comments
            r"(;)",                  # SQL statement terminator
            r"(union\s+select)",     # UNION SELECT
            r"(drop\s+table)",       # DROP TABLE
            r"(insert\s+into)",      # INSERT INTO
            r"(update\s+\w+\s+set)", # UPDATE SET
            r"(delete\s+from)",      # DELETE FROM
        ]
        
        value_lower = value.lower()
        return any(re.search(pattern, value_lower) for pattern in sql_patterns)
    
    @staticmethod
    def validate_and_sanitize(data: dict) -> dict:
        """Validate and sanitize all string fields in a dictionary"""
        sanitized = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                # Check for SQL injection
                if InputValidator.detect_sql_injection(value):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid input detected in field: {key}"
                    )
                
                # Sanitize string
                sanitized[key] = InputValidator.sanitize_string(value)
            elif isinstance(value, dict):
                # Recursively sanitize nested dictionaries
                sanitized[key] = InputValidator.validate_and_sanitize(value)
            else:
                sanitized[key] = value
        
        return sanitized

validator = InputValidator()
