require('dotenv').config()
const assert = require('assert');
const { Builder, By, until } = require('selenium-webdriver');

const Firefox = require('selenium-webdriver/firefox');

const URL = process.env.TEST_URL;

const USERNAME = process.env.LT_USERNAME;
 
const KEY = process.env.KEY;
 
const GRID_HOST = 'hub.lambdatest.com/wd/hub';

const capabilities = {
	"build" : "Health-Samurai CI",
	"name" : "Radmir",
	"platform" : "Windows 10",
	"browserName" : "Chrome",
	"version" : "89.0"
}

const gridUrl = 'https://' + USERNAME + ':' + KEY + '@' + GRID_HOST;

const isLocalBrowserTest = process.env.LOCAL_BROWSER;

const buildDriver = async () => {
	return isLocalBrowserTest
		? await new Builder()
			.forBrowser('firefox')
			.setFirefoxOptions(
				new Firefox.Options()
				.headless()
			)
			.build()
		: await new Builder()
			.usingServer(gridUrl)
			.withCapabilities(capabilities)
			.build()
}

function makeid(length, onlyNum = false) {
	let result = '';
	const characters = onlyNum ? '0123456789' : ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
	   result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}
 
describe("Test suite for live editing", function () {
	let driver;
	this.timeout(0);

	before(async function () {
		driver = await buildDriver();
	});

	step("should be online and have right header", async function () {
		await driver.get(URL)
		const title = await driver.getTitle()
		console.log(title);

		const headerSelector = By.css(".makeStyles-title-2");
		await driver.wait(until.elementLocated(headerSelector));

		const headerElement = await driver.findElements(headerSelector);
		const headerText = await headerElement[0].getText();

		assert(headerText == "Live editing!");
	});

	step("should have all inputs (title, select, date, textarea)", async () => {
		const inputsSelectors = ["input[type=text]", "#select", "input[type=date]", "textarea"]
		await driver.wait(until.elementLocated(By.css("input")));
		for (const selector of inputsSelectors) {
			const element = await driver.findElements(By.css(selector));

			assert(element.length > 0);
		}
	})

	step("should have all inputs disabled at start", async () => {
		const inputsSelectors = ["input[type=text]", "#select", "input[type=date]", "textarea"]
		await driver.wait(until.elementLocated(By.css("input")));
		for (const selector of inputsSelectors) {
			const element = await driver.findElements(By.css(selector));
			const classes = await element[0].getAttribute("class");
			assert(classes.includes("Mui-disabled"));
		}
	})

	step("should generate new room if you get in /", async () => {
		// check if address have changed
		assert((await driver.getCurrentUrl()).length - URL.length > 3);
	})

	describe("Test case for Authentication", async () => {
		step("there is a button for auth", async () => {
			const element = await driver.findElements(By.css(".MuiButton-root"));
			assert(element.length > 0);
		})

		step("login form appears if you click login button", async () => {
			const element = await driver.findElements(By.css(".MuiButton-root"));
			await element[0].click();

			const selector = By.xpath("//*[contains(text(), 'Authorize to live edit!')]");
			await driver.wait(until.elementLocated(selector));

			const dialog = await driver.findElements(By.css('[role=dialog]'));

			assert(dialog.length > 0);
		})

		step("form has log and pass inputs", async () => {
			const dialog = await driver.findElements(By.css('[role=dialog]'));

			const login = await dialog[0].findElements(By.css("[type=text]"));
			const password = await dialog[0].findElements(By.css("[type=password]"));

			assert(login.length > 0 && password.length > 0);
		})

		step("auth with correct credentials", async () => {
			const dialog = await driver.findElements(By.css('[role=dialog]'));

			const login = await dialog[0].findElements(By.css("[type=text]"));
			const password = await dialog[0].findElements(By.css("[type=password]"));

			await login[0].sendKeys("asdf");
			await password[0].sendKeys("asdf");

			const loginButton = await dialog[0].findElements(By.css("button"));
			await loginButton[1].click();

			await driver.wait(until.stalenessOf(dialog[0]), 10000);

			const element = await driver.findElements(By.xpath("//*[contains(text(), 'Create a new document')]"));
			assert(element.length > 0);
		})
	})

	describe("Test case for multiple users edit", async () => {
		const inputsSelectors = ["input[type=text]", "#select", "input[type=date]", "textarea"]
		let tabs;

		const doLiveTest = async (tabN, inputN, originalText = makeid(20), ) => {
			await driver.switchTo().window(tabs[tabN]);

			let liveElement = await driver.findElements(By.css(inputsSelectors[inputN]));
			await liveElement[0].sendKeys(originalText);

			await driver.sleep(500);
			const firstInputText = await liveElement[0].getAttribute("value");
			assert(firstInputText.includes(originalText));
			
			await driver.sleep(2000);
			
			await driver.switchTo().window(tabs[(tabN + 1) % tabs.length]);
			
			liveElement = await driver.findElements(By.css(inputsSelectors[inputN]));
			await liveElement[0].sendKeys(originalText);
			await driver.sleep(500);
			const secondInputText = await liveElement[0].getAttribute("value");
			
			assert(secondInputText.includes(firstInputText));
			await driver.sleep(2000);
		}

		before(async () => {
			const tabUrl = await driver.getCurrentUrl();
			await driver.switchTo().newWindow('tab');
			await driver.get(tabUrl);
		})

		step("should have 2 active tabs", async () => {
			const headerSelector = By.css(".makeStyles-title-2");
			await driver.wait(until.elementLocated(headerSelector));

			tabs = await driver.getAllWindowHandles();

			assert(tabs.length === 2)
		})

		step("checking syncronization of title", async () => {
			await doLiveTest(0, 0);
			await doLiveTest(1, 0);
		})

		step("checking syncronization of textarea", async () => {
			await doLiveTest(0, 3, makeid(40));
			await doLiveTest(1, 3, makeid(40));
			await doLiveTest(0, 3, makeid(40));
			await doLiveTest(1, 3, makeid(40));
			await doLiveTest(0, 3, makeid(40));
			await doLiveTest(1, 3, makeid(40));
		})
	})

	afterEach(async function () {
		if (isLocalBrowserTest) return;

		if (this.currentTest.isPassed) {
		  await driver.executeScript("lambda-status=passed");
		} else {
		  await driver.executeScript("lambda-status=failed");
		}
	});

	after(async function () {
		await driver.quit()
	})
});