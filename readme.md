# LayerRenamer - like a pro
*- a plugin for [Sketch](https://sketchapp.com/)*

#### Rename multiple layers at once using RegEx and flags
- Select your layer(s)
- Hit `⌘-ctrl-R`
- Enter your regex, or just tab if you want it all
- Enter your replacement pattern
- Hit `enter`, and profit!

#### Or, wanna select all layers whose name matches regex?
- Deselect all 
- Hit `⌘-shift-F`
- Enter your regex
- Hit `enter`, and profit!

*Protip: if you skip deselecting, if will look through the ones selected

---

#### RegEx?
Regular Expressions are very powerful. To learn more and try some more, visit [regexr.com](http://regexr.com). Some worthy mentions:
- Select all `.+`
- Use capture groups `item (\d+) (\w+)` will match `item 57 flower` with `$1` as `57` and `$2` as `flower`
- In rename, use the capture groups; `$1-icon $2` would give `flower-icon 57`

#### Flags
Ordered numbers? Dimensions? Find 'n Rename got you covered!
- Using `%N` in the replacement box, you will get an ordered number, starting with first selected layer as nr 1!
- Going for reverse? Try `%-N`
- Like math? `%n` makes the counting start as zero :)
- While we're at it, zero pad with `%NN`
- Want the index of the item in the container? Try `%I` and `%i`
- Get what kind of layers it is: `%k`, or `%K` for something like Shape/Group/Artboard/Page/Slice/Bitmap/Text/Symbol/SymbolMaster/Path
- In the search expression, variables `locked`,`hidden`, as well as `shape` etc are available
- Dimensions! Guess what `%x`, `%y`, `%w`, `%h` will do?
- Ready? *Get the container/group's properties as well!*
- Just hit `%p.t` for title/name, or whatever other flag you want!


### Installation
1. Download and unzip [LayerRenamer](https://github.com/LeonardPauli/LayerRenamer/archive/master.zip)
2. Open the `.sketchplugin` file
3. Have fun!

### Notes
Leave the search/find field empty to match everything
Leaving the expression field empty defaults to `!path && !artboard`

⚠️ Seems like you can't select both layers and their containing group simultaneously. Because of this, if the group is matched (or combined shape container for that matter), it won't match anything inside of it. Add expression !group (or !shape) to search its content instead.
 
### Say thanks
If you enjoy this plugin, please consider [buying me some oatgurt](https://www.paypal.me/leonardpauli/5). You can also drop me a line or [follow  me on Twitter](http://twitter.com/leonardpauli).

### About
Created by Leonard Pauli, in january 2017, after getting inspired by the [RenameIt](https://github.com/rodi01/RenameIt) plugin. Feel free to fork or send pull requests :)