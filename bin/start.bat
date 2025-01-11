start "" "path to elastic search bin folder\elasticsearch.bat"
start "" "path to kibana bin folder\kibana.bat"
start "" "path to logstash bin folder\logstash.bat" -f logstash.conf --config.reload.automatic
start "" "path to filebeat folder\filebeat.exe" -e -c filebeat.yml
cd "path to spring boot project"
mvn spring-boot:run
