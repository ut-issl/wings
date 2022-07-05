# WINGS
Web-based INterface Ground-station Software  
WINGS is a software processing telemetry and command for satellites and satellite components. WINGS is a web application that can be used from both web browsers and HTTP API requests. WINGS supports [C2A](https://github.com/ut-issl/c2a-core)-styled and ISSL-styled telemetry and command formats. Users can implement other formats.  
Usually, interface software is required for the connection between WINGS and satellites. [WINGS_TMTC_IF](https://github.com/ut-issl/wings-tmtc-if) is such software that supports COM port and socket connection. Users can implement other interface software.  
WINGS uses [ASP .NET](https://github.com/dotnet/aspnetcore) for backend software, MySQL for database, and [React](https://github.com/facebook/react) for frontend software.

## Getting Started for Users
### Prerequisites
The application listed below is required:
+ [Docker](https://docs.docker.com/get-docker/)


### Installing
1. Open a terminal.
2. Navigate to the desired location for the repository.
3. Clone the repository.
4. Make sure that docker is running.
5. Create docker images in the directory containing `docker-compose.yml`.
    ```
    docker-compose build
    ```

### Running
1. Start the docker containers.
    ```
    docker-compose up -d
    ```
2. Access `https://localhost:5001` from your browser.
3. If you stop the containers, you can use the following command:
    ```
    docker-compose down
    ```
### Operation
1. Fulfill comment and select a component in the main page.
2. Click the operation start button.
3. Connect WINGS_TMTC_IF to the the operation.
4. Click the operation join button.
5. You can show telemetries and send commands while joining the operation.

### Command
- You can send commands by clicking command line and pushing `"Shift" + "Return"` keys.
- If you want to use command files, click "+" button in command file tabs.
- If you want to add unplanned commands, select command in "Command Selection" area and click "add" button.

### Telemetry
- You can show telemetry by clicking "+" button, selecting showing type and telemetry packet names, and clicking "Open" button.
- "packet" type just shows telemetry values.
- "graph" type shows telemetry graphs.
- You can save and restore telemetry showing layouts (click "Layouts" button).

### Command Logs
- Command logs are shown in "CmdLog" page.
