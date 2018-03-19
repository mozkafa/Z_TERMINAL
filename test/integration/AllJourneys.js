jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"com/btc/terminal/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"com/btc/terminal/test/integration/pages/Worklist",
		"com/btc/terminal/test/integration/pages/Object",
		"com/btc/terminal/test/integration/pages/NotFound",
		"com/btc/terminal/test/integration/pages/Browser",
		"com/btc/terminal/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.btc.terminal.view."
	});

	sap.ui.require([
		"com/btc/terminal/test/integration/WorklistJourney",
		"com/btc/terminal/test/integration/ObjectJourney",
		"com/btc/terminal/test/integration/NavigationJourney",
		"com/btc/terminal/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});