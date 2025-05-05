export function showHelp() {
  console.log(`
Available commands:

  Navigation & Working Directory:
    up                       - Go to parent directory
    cd <path_to_directory>   - Change directory
    ls                       - List directory content

  File Operations:
    cat <path_to_file>       - Read file content
    add <new_file_name>      - Create empty file
    mkdir <new_directory_name> - Create directory
    rn <path_to_file> <new_filename> - Rename file/directory
    cp <path_to_file> <path_to_new_directory> - Copy file
    mv <path_to_file> <path_to_new_directory> - Move file
    rm <path_to_file>        - Delete file/directory

  Operating System Info:
    os --EOL                 - Show default End-Of-Line
    os --cpus                - Show host CPU info
    os --homedir             - Show home directory
    os --username            - Show system username
    os --architecture        - Show CPU architecture

  Hash Calculation:
    hash <path_to_file>      - Calculate SHA256 hash for file

  Compression:
    compress <path_to_file> <path_to_destination> - Compress file (Brotli)
    decompress <path_to_file> <path_to_destination> - Decompress file (Brotli)

  Other:
    .exit                    - Exit the application
    help                     - Show this help message
`);
}
