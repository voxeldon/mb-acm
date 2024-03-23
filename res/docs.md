# Minecraft Bedrock Addon Configuration Manager (ACM)

## Introduction
The Addon Configuration Manager (ACM) for Minecraft Bedrock is designed to streamline the configuration process for addons. It offers developers an efficient way to design configuration menus through a simple setup, utilizing Minecraft's scoreboard system and following specific syntax rules.

## Language Key Format
To standardize the configuration settings, the following key formats are used:

- `acm.team_name.addon_name`
- `acm.team_name.addon_name.setting_name`
- `acm.team_name.addon_name.setting_name.special_case`

## Configuration Definitions
Configuration settings can be defined in various types, each serving different purposes:

### Boolean Toggle
```plaintext
id(bool) 0 | 1
```

### Integer Slider
```plaintext
id(range[min, max, step]) default_value
```

### Multiple Choice
```plaintext
id(choice[a,b,c]) default_value
```

### Text Input Field
```plaintext
id(input[?default_value]) null
```

## Implementation Guide

### Step 1: Scoreboard Creation
Create a scoreboard to hold your configuration settings:
```plaintext
/scoreboard objectives add "acm.team_name.addon_name" dummy
```

### Step 2: Menu Settings
Define your menu settings using score names:

- **Boolean Setting:**
    ```plaintext
    /scoreboard players add "my_setting_name(bool)" "acm.team_name.addon_name" 0
    ```
- **Slider Setting:**
    ```plaintext
    /scoreboard players add "despawn_dist(range[0, 100, 10])" "acm.team_name.addon_name" 50
    ```
- **Multiple Choice Setting:**
    ```plaintext
    /scoreboard players add "fav_color(choice[Red,Blue,Green])" "acm.team_name.addon_name" 1
    ```
- **Text Input:**
    ```plaintext
    /scoreboard players add "use_name(input[Enter a user name.])" "acm.team_name.addon_name" 0
    ```

### Step 3: Visual Text Definition
Define the visual text for your menu in the addon language file. For example:
```plaintext
//Example from ACM lang
acm.vxl.acm_config=§l§2A§f.§6C§f.§4M§r
acm.vxl.acm_config.require_op=§l§4Require OP §r§o(Require op to access config menu)
acm.vxl.acm_config.require_tag=§l§3Require Tag §r§o(Require tag to access config menu)
acm.vxl.acm_config.tag_id=§l§2Tag Id §r§o(If using require tag)
```

### Step 4: Menu Icon
To set your menu icon, create the following folder structure in your resource pack and place your icon (under 256x256 in size) in the specified location:
```plaintext
resource_pack/
    _acm/
        team_name/
            addon_name/
                pack_icon.png
```

## Parsing Settings
When the submission button is pressed in-game, the addon will emit a script event related to it. You can listen for setting changes and utilize the data as follows:
```typescript
system.afterEvents.scriptEventReceive.subscribe((event) => {
    if(event.id === 'acm:team_name.pack_name'){ // Note: 'acm:' is required 
        const myPack = JSON.parse(event.message); 
        const requireOp = myPack.require_op;
        console.warn(requireOp);
    }
});
```
