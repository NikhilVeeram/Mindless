# Mindless
App for making organizing your school life mindless.

## Troubleshooting

If you run into issues running `npm` or `npx` commands (e.g. `npx : The term 'npx' is not recognized as the name of a cmdlet...`) inside VS Code's terminal on Windows, it might be due to your environment `Path` variables not merging correctly. Run the following command in PowerShell to fix it for your current session:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```
