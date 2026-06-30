# Single-stage build using pre-built JAR from local Maven build
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create non-root user for security
RUN groupadd -g 1000 appuser && \
    useradd -u 1000 -g appuser appuser

# Copy the pre-built application JAR
COPY target/indicab-backend-*.jar app.jar

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8000/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", \
    "-Xmx512m", \
    "-Xms256m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", \
    "-jar", \
    "app.jar"]
