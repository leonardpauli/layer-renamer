# LayerRenamer - like a pro &nbsp;&nbsp;<a href="http://bit.ly/SketchRunnerWebsite"><img src="http://sketchrunner.com/img/badge_blue.png" width=120></a>

*- a plugin for [Sketch](https://sketchapp.com/)*

Tested with Sketch v. 45.1

##  <img src="https://github.com/LeonardPauli/LayerRenamer/raw/master/LayerRenamer.sketchplugin/Contents/Resources/icons/layerRenamerRename.png" width=48> Rename multiple layers at once using RegEx and flags
- Select your layer(s)
- Hit `⌘-⎇-R`
- Enter your regex, or just tab if you want it all
- Enter your replacement pattern
- Hit `enter`, and profit!

##  <img src="https://github.com/LeonardPauli/LayerRenamer/raw/master/LayerRenamer.sketchplugin/Contents/Resources/icons/layerRenamerSelect.png" width=48> Select layers - Pro style
- Deselect all 
- Hit `⌘-⎇-F`
- Enter your regex, flags, and/or relative path
- Hit `enter`, and profit!

*Protip: if you skip deselecting, if will look through the ones selected*
*Also: `⌘-enter` is faster then clicking the second button*

<img src="https://github.com/LeonardPauli/LayerRenamer/raw/master/demos/screenshot.png" width="100%">

---

#### RegEx?
Regular Expressions are very powerful. To learn more and try some more, visit [regexr.com](http://regexr.com). Some worthy mentions:
- Select all `.+`
- Use capture groups `item (\d+) (\w+)` will match `item 57 flower` with `$1` as `57` and `$2` as `flower`
- In rename, use the capture groups; `$1-icon $2` would give `flower-icon 57`
- Adding a prefix or suffix is very simple, check out [this question](https://github.com/LeonardPauli/LayerRenamer/issues/1) for some demos

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

#### Relative find paths!
Write `:` in the end of a search expression, followed by any of the following, stacked how many times you desire, to navigate the layer tree:
- `>` all children
- `<` parent
- `2` third layer in parent (counting starts at 0)
- `2n` every other layer
- `+1` layer after
- `-4` layer four layers before
This means you could write something like this: `input (\w+):<+1>3n+1` and in the replacement box write `$1 label decoration %I` to rename every third (skipping the first) layer, in the group right after the group containing the selected field. Better yet, it does so even if you would have tens (or thousands...) of those "named input fields with labels having lots of strange decoration"... Ok, but seriously, pretty handy.

#### Transform cases flags
You can transform string cases using flags when replacing. Try writing the following in the replace box: `\T $1 this becomes \U uppErcase \E or What?`, it should give you `ThisBecomes UPPERCASE or What?`;
- `\L` lowercase, ie. "make the following characters lowercase"
- `\U` UPPERCASE
- `\C` camelCase
- `\K` kebab-case
- `\E` end, ie. stop changing the case
- `\S` snake_case
- `\T` TitleCase
- `\W` word case

<img src="https://github.com/LeonardPauli/LayerRenamer/blob/master/demos/transform%20cases.gif?raw=true" width="100%">

#### Example workflow: Rename using child layer name
Use case: You've got a bunch of similar structured groups with layers inside of them. All the groups are just called "Group", however the first layer inside has the right name! You would like to rename the parent group to the layers name, and then maybe rename all the layers. No problem with LayerRenamer!
1. First, select the parent artboard (or just deselect all layers to select the page, if you want to rename the artboards)
2. `cmd-alt-F`, and write `Grou`... + hit `enter` to select all layers whose name contains "Grou" (ie. `Group 1`)
3. `cmd-alt-R`, keep the first box empty (to choose the whole name), and in the second, write `icon %>0.t`, hit `enter`
4. This will replace all selected groups names with "icon " followed by their first child layer's name (`%`, flag/start navigate, `>` children, `0` first, `.t` title/name)
5. Now, select all the groups first child; `cmd-alt-F`, write `:>0` (`:` start navigate, `>` children, `0` first), and hit `cmd-enter` to start the filter from the currently selected groups
6. `cmd-alt-R`, leave first empty, put `image` or something in second, hit `enter`
7. Enjoy all the extra time you suddenly have left over :)

<img src="https://github.com/LeonardPauli/LayerRenamer/blob/master/demos/rename%20using%20children.gif?raw=true" width="100%">
More advanced:
<img src="https://github.com/LeonardPauli/LayerRenamer/blob/master/demos/rename%20group%20using%20inner%20layer%20name.gif?raw=true" width="100%">

#### Beta: Copy outline
Use case: The folder/layer structure you've got in the sidebar could be made to closely resemble the actual markup or css, etc. Together with the plugin, you'll also get an action called "Copy page outline". Just select a parent layer or deselect everything (to export the whole page), then run the action. This is very much just a hint of [what to come](https://github.com/LeonardPauli/LayerRenamer/issues/2), nevertheless handy as it is.
<img src="https://github.com/LeonardPauli/LayerRenamer/blob/master/demos/copy%20outline%20pug%20beta.gif?raw=true" width="100%">


### Installation
1. Download and unzip [LayerRenamer](https://github.com/LeonardPauli/LayerRenamer/archive/master.zip)
2. Open the `.sketchplugin` file
3. Have fun!

### Notes
Leave the search/find field empty to match everything
Leaving the expression field empty defaults to `!path && !artboard`

⚠️ Seems like you can't select both layers and their containing group simultaneously. Because of this, if the group is matched (or combined shape container for that matter), it won't match anything inside of it. Add expression !group (or !shape) to search its content instead.

### Contribute
Feel like adding / fixing something? Create an issue and/or send a pull request! :D

See [skpm readme](https://github.com/skpm/skpm/blob/master/README.md) and [lpdocs/design/sketch/plugins/create](https://github.com/leonardpauli/docs/tree/master/design/sketch/plugins/create.rim) on how to get started.
 
### Say thanks
If you enjoy this plugin, please consider [buying me some oatgurt](https://www.paypal.me/leonardpauli/5USD). You can also drop me a line or [follow  me on Twitter](http://twitter.com/leonardpauli). Got an idea for a new plugin? Send me a tweet!

### About
Created by Leonard Pauli, in january 2017, after getting inspired by the [RenameIt](https://github.com/rodi01/RenameIt) plugin. Feel free to fork or send pull requests :)
