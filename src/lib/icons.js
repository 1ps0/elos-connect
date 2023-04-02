/*
1st order
https://ibm.github.io/carbon-icons-svelte/

carbon gives us the ability to do icon composition for complex features and functions
we can give the user a simple primer on this and make the primer available for reference in a panel
panel type: Reference
*/

import AccessibilityColor16 from "carbon-icons-svelte/lib/AccessibilityColor16";
import AccessibilityColorFilled16 from "carbon-icons-svelte/lib/AccessibilityColorFilled16";
import AddFilled16 from "carbon-icons-svelte/lib/AddFilled16";
import Alarm16 from "carbon-icons-svelte/lib/Alarm16";
import AlarmAdd16 from "carbon-icons-svelte/lib/AlarmAdd16";
import AlarmSubtract16 from "carbon-icons-svelte/lib/AlarmSubtract16";
import Api_116 from "carbon-icons-svelte/lib/Api_116";
import App16 from "carbon-icons-svelte/lib/App16";
import AudioConsole16 from "carbon-icons-svelte/lib/AudioConsole16";
import Awake16 from "carbon-icons-svelte/lib/Awake16";
import Categories16 from "carbon-icons-svelte/lib/Categories16";
import CheckmarkFilled16 from "carbon-icons-svelte/lib/CheckmarkFilled16";
import CollapseCategories16 from "carbon-icons-svelte/lib/CollapseCategories16";
import ClosedCaptionAlt16 from "carbon-icons-svelte/lib/ClosedCaptionAlt16";
import CloseFilled16 from "carbon-icons-svelte/lib/CloseFilled16";
import Code16 from "carbon-icons-svelte/lib/Code16";
import CodeReference16 from "carbon-icons-svelte/lib/CodeReference16";
import Compare16 from "carbon-icons-svelte/lib/Compare16";
import Crossroads16 from "carbon-icons-svelte/lib/Crossroads16";
import CrossTab16 from "carbon-icons-svelte/lib/CrossTab16";
import Cut16 from "carbon-icons-svelte/lib/Cut16";
import Delete16 from "carbon-icons-svelte/lib/Delete16";
import DataVis_416 from "carbon-icons-svelte/lib/DataVis_416";
import DeployRules16 from "carbon-icons-svelte/lib/DeployRules16";
import Download16 from "carbon-icons-svelte/lib/Download16";
import Education16 from "carbon-icons-svelte/lib/Education16";
import Exit16 from "carbon-icons-svelte/lib/Exit16";
import Export16 from "carbon-icons-svelte/lib/Export16";
import Image16 from "carbon-icons-svelte/lib/Image16";
// import Jpg16 from "carbon-icons-svelte/lib/Jpg16";
import Json16 from "carbon-icons-svelte/lib/Json16";
import Launch16 from "carbon-icons-svelte/lib/Launch16";
import Layers16 from "carbon-icons-svelte/lib/Layers16";
import Login16 from "carbon-icons-svelte/lib/Login16";
import Maximize16 from "carbon-icons-svelte/lib/Maximize16";
import Menu16 from "carbon-icons-svelte/lib/Menu16";
import ModelAlt16 from "carbon-icons-svelte/lib/ModelAlt16";
import Pdf16 from "carbon-icons-svelte/lib/Pdf16";
import Pin16 from "carbon-icons-svelte/lib/Pin16";
import Settings16 from "carbon-icons-svelte/lib/Settings16";
import Switcher16 from "carbon-icons-svelte/lib/Switcher16";
import Sql16 from "carbon-icons-svelte/lib/Sql16";
import Terminal16 from "carbon-icons-svelte/lib/Terminal16";
import ToolsAlt16 from "carbon-icons-svelte/lib/ToolsAlt16";
import Txt16 from "carbon-icons-svelte/lib/Txt16";
import UserAvatarFilled16 from "carbon-icons-svelte/lib/UserAvatarFilled16";
import ViewMode_116 from "carbon-icons-svelte/lib/ViewMode_116";
import ViewMode_216 from "carbon-icons-svelte/lib/ViewMode_216";
import Warning16 from "carbon-icons-svelte/lib/Warning16";
import WatsonHealthCutInHalf16 from "carbon-icons-svelte/lib/WatsonHealthCutInHalf16";
// import WatsonHealthStackedScrolling_116 from "carbon-icons-svelte/lib/WatsonHealthStackedScrolling_116";
// import WatsonHealthThumbnailPreview16 from "carbon-icons-svelte/lib/WatsonHealthThumbnailPreview16";
// import WifiOff16 from "carbon-icons-svelte/lib/WifiOff16";
// import Wifi16 from "carbon-icons-svelte/lib/Wifi16";
// import Zip16 from "carbon-icons-svelte/lib/Zip16";


export let icons = {
  // main menu
  "alarm": Alarm16,
  "cli": Terminal16,
  "code": Code16,
  "list": CollapseCategories16,
  "table": CrossTab16,
  "image": Image16,
  "files": Categories16,
  "packages": ModelAlt16,
  "education": Education16,
  "profile": UserAvatarFilled16,
  "settings": Settings16,
  "preferences": AudioConsole16,
  "polls": DeployRules16,

  // dataviz
  "composite": DataVis_416,

  // toolbar
  "status-hidden": AccessibilityColor16,
  "status-visible": AccessibilityColorFilled16,
  "status-checkmark": CheckmarkFilled16,
  "status-closemark": CloseFilled16,
  // "status-online": Wifi16,
  // "status-offline": WifiOff16,
  "status-pin": Pin16,

  "action-add": AddFilled16,
  "action-popout": Launch16,
  "action-fullscreen": Maximize16,
  "action-login": Login16,
  "action-logout": Exit16,

  "action-open-code": CodeReference16,

  "task-add": AlarmAdd16,
  "task-remove": AlarmSubtract16,
  "task-merge": Compare16,

  // configuration
  "apis": Api_116,
  "apps": App16,

  //
  "transript": ClosedCaptionAlt16,
  "download": Download16,
  "upload": Export16,

  "directions": Crossroads16,
  "cut": Cut16,
  "delete": Delete16,

  // filetypes
  // "jpg": Jpg16,
  "json": Json16,
  "pdf": Pdf16,
  "txt": Txt16,
  // "zip": Zip16,

  // mode settings
  "night-mode": Awake16,
  "view-modes": Switcher16,
  "view-mode-layers": Layers16,
  // "view-mode-workspaces": WatsonHealthStackedScrolling_116,
  "view-mode-1": ViewMode_116,
  "view-mode-2": ViewMode_216,
  "view-mode-3": WatsonHealthCutInHalf16,
  // "view-mode-4": WatsonHealthThumbnailPreview16,

  // misc
  "menu": Menu16,
  "sql": Sql16,
  "tools": ToolsAlt16,
  "warning": Warning16,


};
