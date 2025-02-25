start "" "elasticsearch.bat"
start "" "kibana.bat"
@REM start "" "path to logstash bin folder\logstash.bat" -f logstash.conf --config.reload.automatic
cd "E:\filebeat-8.17.0-windows-x86_64"
start "" "./filebeat.exe -e -c ./filebeat.yml"
start "" "ollama run deepseek-r1:1.5b"
cd "D:/PICT BE CE 24-25/Logs Management Dashboard/simple-note"
nodemon app.js
