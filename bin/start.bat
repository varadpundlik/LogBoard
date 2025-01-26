start "" "elasticsearch.bat"
start "" "kibana.bat"
@REM start "" "path to logstash bin folder\logstash.bat" -f logstash.conf --config.reload.automatic
start "" "E:/filebeat/filebeat.exe" -e -c filebeat.yml
cd "D:/PICT BE CE 24-25/Logs Management Dashboard/spring-boot-logs-management-dashboard"
mvn spring-boot:run
