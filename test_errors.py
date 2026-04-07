from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')

driver = webdriver.Chrome(options=options)
driver.get('http://localhost:8000/gallery.html')
time.sleep(2)

logs = driver.get_log('browser')
for log in logs:
    print(log['level'], log['message'])

driver.quit()
