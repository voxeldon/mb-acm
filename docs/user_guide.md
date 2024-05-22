# ACM Addon Guide

## Installation Steps

### 1. Install ACM Addon
Ensure you have the ACM addon downloaded and installed.

### 2. Install ACM-Compatible Addons
Install any additional addons that are compatible with ACM.

### 3. Load Order Configuration
Ensure ACM is at the top of your load order to function correctly.

### 4. Enable Cheats
Temporarily enable cheats in your game. Cheats can be disabled after initial setup.

### 5. Run the ACM Tool Command
Execute the following command to start using ACM:
```
/scriptevent acm:tool
```

### 6. View and Adjust Addon Configuration
All supported addon information and configurations can be viewed or adjusted using the ACM tool.

### 7. Disable Cheats (Optional)
If desired, you can disable cheats after the initial setup.

### 8. Realm Owners Recommendation
For realm owners, it is recommended to:
- Enable the "Require Tag" setting.
- Define a tag ID before launching publicly.

This ensures only authorized users can change settings for any addon using the ACM tool.

## Removing an Addon

If you decide to remove one of your installed addons, use the following command to delete the addon's address from ACM's registry:
```
/scriptevent acm:del team.addon
```

Ensure to replace `team.addon` with the actual identifier of the addon you wish to remove.

If you're unsure of the correct addon address, check the mod author's uninstall instructions. Alternatively, you can use the following command to preview local scoreboards:
```
/scoreboard objectives setdisplay sidebar acm
```
Any related ACM addon should appear in the chat window for most devices.