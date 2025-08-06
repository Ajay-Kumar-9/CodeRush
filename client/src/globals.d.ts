// globals.d.ts or in your existing types declaration file

interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}



