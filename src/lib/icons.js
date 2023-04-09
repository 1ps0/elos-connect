/*
1st order
https://ibm.github.io/carbon-icons-svelte/

carbon gives us the ability to do icon composition for complex features and functions
we can give the user a simple primer on this and make the primer available for reference in a panel
panel type: Reference
*/

import AccessibilityColor from "carbon-icons-svelte/lib/AccessibilityColor.svelte";
import AccessibilityColorFilled from "carbon-icons-svelte/lib/AccessibilityColorFilled.svelte";
import AddFilled from "carbon-icons-svelte/lib/AddFilled.svelte";
import Alarm from "carbon-icons-svelte/lib/Alarm.svelte";
import AlarmAdd from "carbon-icons-svelte/lib/AlarmAdd.svelte";
import AlarmSubtract from "carbon-icons-svelte/lib/AlarmSubtract.svelte";
import Api_1 from "carbon-icons-svelte/lib/Api_1.svelte";
import App from "carbon-icons-svelte/lib/App.svelte";
import AudioConsole from "carbon-icons-svelte/lib/AudioConsole.svelte";
import Awake from "carbon-icons-svelte/lib/Awake.svelte";
import Categories from "carbon-icons-svelte/lib/Categories.svelte";
import CheckmarkFilled from "carbon-icons-svelte/lib/CheckmarkFilled.svelte";
import CollapseCategories from "carbon-icons-svelte/lib/CollapseCategories.svelte";
import ClosedCaptionAlt from "carbon-icons-svelte/lib/ClosedCaptionAlt.svelte";
import CloseFilled from "carbon-icons-svelte/lib/CloseFilled.svelte";
import Code from "carbon-icons-svelte/lib/Code.svelte";
import CodeReference from "carbon-icons-svelte/lib/CodeReference.svelte";
import Compare from "carbon-icons-svelte/lib/Compare.svelte";
import Crossroads from "carbon-icons-svelte/lib/Crossroads.svelte";
import CrossTab from "carbon-icons-svelte/lib/CrossTab.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";
import DataVis_4 from "carbon-icons-svelte/lib/DataVis_4.svelte";
import DeployRules from "carbon-icons-svelte/lib/DeployRules.svelte";
import Download from "carbon-icons-svelte/lib/Download.svelte";
import Education from "carbon-icons-svelte/lib/Education.svelte";
import Exit from "carbon-icons-svelte/lib/Exit.svelte";
import Export from "carbon-icons-svelte/lib/Export.svelte";
import Image from "carbon-icons-svelte/lib/Image.svelte";
import Jpg from "carbon-icons-svelte/lib/Jpg.svelte";
import Json from "carbon-icons-svelte/lib/Json.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";
import Layers from "carbon-icons-svelte/lib/Layers.svelte";
import Login from "carbon-icons-svelte/lib/Login.svelte";
import Maximize from "carbon-icons-svelte/lib/Maximize.svelte";
import Menu from "carbon-icons-svelte/lib/Menu.svelte";
import ModelAlt from "carbon-icons-svelte/lib/ModelAlt.svelte";
import Pdf from "carbon-icons-svelte/lib/Pdf.svelte";
import Pin from "carbon-icons-svelte/lib/Pin.svelte";
import Settings from "carbon-icons-svelte/lib/Settings.svelte";
import Switcher from "carbon-icons-svelte/lib/Switcher.svelte";
import Sql from "carbon-icons-svelte/lib/Sql.svelte";
import Terminal from "carbon-icons-svelte/lib/Terminal.svelte";
import ToolsAlt from "carbon-icons-svelte/lib/ToolsAlt.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
import Txt from "carbon-icons-svelte/lib/Txt.svelte";
import UserAvatarFilled from "carbon-icons-svelte/lib/UserAvatarFilled.svelte";
import ViewMode_1 from "carbon-icons-svelte/lib/ViewMode_1.svelte";
import ViewMode_2 from "carbon-icons-svelte/lib/ViewMode_2.svelte";
import Warning from "carbon-icons-svelte/lib/Warning.svelte";
import WatsonHealthCutInHalf from "carbon-icons-svelte/lib/WatsonHealthCutInHalf.svelte";
import WatsonHealthStackedScrolling_1 from "carbon-icons-svelte/lib/WatsonHealthStackedScrolling_1.svelte";
import WatsonHealthThumbnailPreview from "carbon-icons-svelte/lib/WatsonHealthThumbnailPreview.svelte";
import WifiOff from "carbon-icons-svelte/lib/WifiOff.svelte";
import Wifi from "carbon-icons-svelte/lib/Wifi.svelte";
import Zip from "carbon-icons-svelte/lib/Zip.svelte";


export let icons = {
  // main menu
  "alarm": Alarm,
  "cli": Terminal,
  "code": Code,
  "list": CollapseCategories,
  "table": CrossTab,
  "image": Image,
  "files": Categories,
  "packages": ModelAlt,
  "education": Education,
  "profile": UserAvatarFilled,
  "settings": Settings,
  "preferences": AudioConsole,
  "polls": DeployRules,

  // dataviz
  "composite": DataVis_4,

  // toolbar
  "status-hidden": AccessibilityColor,
  "status-visible": AccessibilityColorFilled,
  "status-checkmark": CheckmarkFilled,
  "status-closemark": CloseFilled,
  "status-online": Wifi,
  "status-offline": WifiOff,
  "status-pin": Pin,

  "action-add": AddFilled,
  "action-popout": Launch,
  "action-fullscreen": Maximize,
  "action-login": Login,
  "action-logout": Exit,

  "action-open-code": CodeReference,

  "task-add": AlarmAdd,
  "task-remove": AlarmSubtract,
  "task-merge": Compare,

  // configuration
  "apis": Api_1,
  "apps": App,

  //
  "transript": ClosedCaptionAlt,
  "download": Download,
  "upload": Export,

  "directions": Crossroads,
  "cut": Cut,
  "TrashCan": TrashCan,

  // filetypes
  "jpg": Jpg,
  "json": Json,
  "pdf": Pdf,
  "txt": Txt,
  "zip": Zip,

  // mode settings
  "night-mode": Awake,
  "view-modes": Switcher,
  "view-mode-layers": Layers,
  "view-mode-workspaces": WatsonHealthStackedScrolling_1,
  "view-mode-1": ViewMode_1,
  "view-mode-2": ViewMode_2,
  "view-mode-3": WatsonHealthCutInHalf,
  "view-mode-4": WatsonHealthThumbnailPreview,

  // misc
  "menu": Menu,
  "sql": Sql,
  "tools": ToolsAlt,
  "warning": Warning,


};
