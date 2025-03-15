My VSCode setup and extension

### Two instances

I use a separate VSCode instance as a scratchpad (https://code.visualstudio.com/docs/editor/portable).

Separate instances can have different app icons (may need to give iterm full disk access):

```sh
brew install fileicon
wget https://github.com/dhanishgajjar/vscode-icons/raw/refs/heads/master/icns/synthwave_option_3.icns
sudo fileicon set '/Applications/VS Scratch/Visual Studio Scratch.app' synthwave_option_3.icns

wget https://github.com/dhanishgajjar/vscode-icons/raw/refs/heads/master/icns/synthwave_option_6.icns
sudo fileicon set '/Applications/Visual Studio Code.app' synthwave_option_6.icns

```

### Scratchpad

Scratchpad instance runs in a specific directory. Files created in that directory are instantly opened in that instance. That's what this extension does: watch the directory and open anything new.

To focus instance use `open '/Applications/VS Scratch/Visual Studio Scratch.app'`

So assuming your scrachpad directory is `/Users/jarvis-hmac/scratchpad/` to open a file from python just do this:

```python
import subprocess

with open("/Users/jarvis-hmac/scratchpad/somenew3fi2le.txt", "w") as f:
    f.write("hey")
subprocess.run(["open", "/Applications/VS Scratch/Visual Studio Scratch.app"])
```


### json manipulation

Commands to transform json: sort, format, minify, unstringify (recurively)
