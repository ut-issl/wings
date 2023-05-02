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

### Functions available to use for *.ops file
- Command
	+ Four types of Command are available for OBC: `RT`, `TL`, `UTL`, `BL`
- Comment
	+ Comment function is available by prefixing a line with `#`.
- Other Functions
	+ `call`: You can call other *.ops file.
		+ ex.) `call TEST.ops`．
	+ `wait_sec`: You can specify how many seconds to wait before moving to the next file line.
		+ ex.) `wait_sec 2`
	+ `let`: You can define internal variables.
		+ The right-hand side of the `let` function can perform four arithmetic operations and other operations (*1).
		+ The current telemetry value or an already defined variable using `let` function can be assigned by enclosing it in braces `{}`.
		+ ex.1)`let testA = 10 + 60 * 10`
        + ex.2) `let testB = {testA} + 10 * Math.sin(Math.PI)`
    + `get`: You can get the current value of the telemerty or the defined variable.
		+ ex.) `get testA`
	+ `check_value`: You can check whether a specific value fulfills the requirement.
		+ `check_value` function is basically used as follows:
            + `check_value A == B`
            + `check_value A >= B`
		+ Currently, `A` is limited to telemetry names and variables defined by `let` function.
		+ `B` can be any value, the names of telemetry, or variables already defined using `let` function.
            + The names of telemetry, or variables already defined must be enclosed in braces {}.
	+ `wait_until`: 条件式が成立するまで待機する機能．
		+ `wait_until` function is basically used as follows:
            + `wait_until A == B`
            + `wait_until A >= B`
		+ Currently, `A` is limited to telemetry names and variables defined by `let` function.
		+ `B` can be any value, the names of telemetry, or variables already defined using `let` function.
            + The names of telemetry, or variables already defined must be enclosed in braces {}.

- Annotation(*1)：About other operations
    + The following is a list of operations that can be used in addition to the four basic arithmetic operations:
    + [Math Object](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math)
        + Javascript provides built-in objects that allow the following operations:
        + ex.)
            + `Math.PI`
            + `Math.abs(x)`
            + `Math.asin(x)`
            + `Math.acos(x)`
            + `Math.hypot(x, y, z, ...)`

### API List
- `HttpGet`
    + `api/operations`
        + Get current operations
    + `api/operations/{id}/cmd`
        + Get all commands
    + `api/operations/{id}/cmd_fileline/log`
        + Get commmand fileline logs
    + `api/operations/history`
        + Get a list of operations finished
    + `api/operations/{id}/history/cmd_logs`
        + Get a list of opeartion command logs
    + `api/operations/{id}/history/cmdfile_logs`
        + Get a list of opeartion command file logs
    + `api/operations/{id}/history/tlm_logs`
        + Get a list of opeartion telemetry logs
    + `api/operations/{id}/lyt`
        + Get a list of telemetry display layouts
- `HttpPost`
    + `api/operations`
        + create a new operation
    + `api/operations/{id}/cmd/raw`
        + post command data to TMTC-IF
    + `api/operations/{id}/cmd_fileline_logs`
        + post command file line
    + `api/operations/{id}/lyt`
        + Create a new telemetry display layout