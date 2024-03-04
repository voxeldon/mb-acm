# mb-acm
 Minecraft Bedrock Addon Configuration Manager


## Setup
Make a single scoreboard in the following format to house all your pack settings.

`acm.team_name.pack_name`

``

Define the display name in your lang file.

`acm.my_team.test_pack=Test Pack!`

Settings can be defined with scores

`scoreboard players add "my_setting(bool)" default_value(use 0 or 1)` for a toggle

`scoreboard players add "my_setting(range[min, max, step]) default_value"` for a toggle

Define the display name for settings in your lang file 

```
    acm.team_name.my_setting=Setting Display Name
```