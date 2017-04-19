# robotf-extension README

This is Visual Studio Code extension for robot framework. this extension is still in its early stage but its fully functional.
This Extension was created for internal use for Test Engineer at KMK-Labs, but published into Visual Studio Code Extension Marketplace for everyone to use. please email me at nayanda.haberty@kmklabs.com if you found a bug or need new features, I'll try my best to deliver it.

## Features

* Keyword Autocomplete
    * it scans all the included resources and search for its keywords
    * it will suggest common keywords from BuiltIn, Selenium2Library, ExtendedSelenium2Library, and more

![Keyword Autocomplete](smart-keyword-autocomplete.png)

* Resource Autocomplete
    * it scans all resources

![Resource Autocomplete](smart-resource-autocomplete.png)

* Variable Autocomplete
    * it scans all the included resources and search for its global variables
    * it scans all variables from local files

![Variable Autocomplete](smart-variable-autocomplete.png)

* Language Autocomplete

![Language Autocomplete](builtin-grammar-autocomplete.png)

* Keyword Definition
    * Show the original keyword location
    * ctrl + click to the keyword will bring you to the original keyword location

![Keyword Definition](keyword-definition.png)

* Variable Definition
    * Show the original global and suite variable location
    * ctrl + click to the variable will bring you to the original variable location

![Variable Definition](variable-definition.png)

* Keyword Rename
    * can rename keyword and all its refference

![Keyword Rename](keyword-rename.png)

* Variable Hover
    * Hovering your mouse on global variable will give you the information about its initialization value

![Variable Hover](variable-hover.png)

* Keyword Hover
    * Hovering your mouse on Keyword will give you the information about its Arguments and Return Value

![Keyword Hover](keyword-hover.png)

## Requirements

You need to have robotframework language support for visual studio code

## Known Issues

Performance issues when handle more than 350++ files in workspace

## For Contributors

You can added new suggestion library with its keywords at src/commonKeywordDictionary.ts with format:
``` typescript
export var LIB =
	[
        //your new library is here
		{
			name: "libraryName", //name must be correct
			key: [ "keyword1", "keyword2" ]
        },
        ...
    ]
    
```

## Release Notes

Initial release

### 1.0.0
Initial release of robot framework extension

### 1.1.0
Added definition provider

### 1.2.0
Added rename provider

### 1.3.1
Added hover provider
