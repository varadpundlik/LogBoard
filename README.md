# LogBoard

LogBoard is a comprehensive Logs Management Dashboard designed to simplify the process of monitoring, analyzing, and managing application logs. It provides an intuitive interface and powerful tools to help developers and administrators ensure system reliability and performance.

## Features

- **Centralized Log Management**: Collect and manage logs from multiple sources in one place.
- **Real-time Monitoring**: View logs in real-time for quick debugging and issue resolution.
- **Search and Filtering**: Easily search and filter logs using advanced query capabilities.
- **Custom Dashboards**: Create personalized dashboards to visualize key metrics and trends.
- **Alerts and Notifications**: Set up alerts for specific log patterns or thresholds.
- **Secure Access**: Role-based access control to ensure data security.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/logboard.git
    ```
2. Navigate to the project directory:
    ```bash
    cd logboard
    ```
3. Go to src/llm_service
    ```bash
    pip install -r requirement.txt
    uvicorn gemini:app --host 0.0.0.0 --port 5001 --reload 
    ```   
3. Go to src/server
    ```bash
    npm i
    node index.js 
    ```  
5. Go to src/client
    ```bash
    npm i
    npm run dev 
    ```                         


## Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Configure your log sources in the settings.
3. Start monitoring and analyzing your logs.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Description of changes"
    ```
4. Push to your branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

Contributors to this project:

[Varad Pundlik](https://github.com/varadpundlik)

[Divyank Sagvekar](https://github.com/divyank007)

[Parth Tagalpallewar](https://github.com/ParthTagalpallewar)

[Anirudha Udgirkar](https://github.com/Anirudha1821)