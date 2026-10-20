圓霖茶業網站後台｜最新版說明
更新日期：2026-10-20
正式網站：https://yuanlintea.com.tw
Cloudflare Pages 專案：yuanlin-tea

一、快速開始
1. 將整個資料夾複製到 Windows 電腦的本機磁碟，先解壓縮再使用；不要只複製 tea_admin.exe，也不要直接在 ZIP 壓縮檔中執行。
2. 確認資料夾內有 tea_admin.exe、_internal、tea_data.json、site、cloudflare_pages.json。
3. 雙擊 tea_admin.exe。此程式已封裝執行環境，不必另外安裝 Python 或網站伺服器。
4. 網路連線可用且 cloudflare_pages.json 存在時，「前台內容」中的「儲存後自動發布到 Cloudflare Pages」預設會啟用。
5. 修改網站、商品、分類或精選資料並儲存後，程式會更新本機 site，再自動發布至正式網站。請等發布狀態顯示「上傳成功」再關閉程式。
6. 發布完成後可開啟 https://yuanlintea.com.tw 檢查；若瀏覽器仍顯示舊畫面，請使用 Ctrl+F5 或無痕視窗。

二、資料夾內檔案
- tea_admin.exe：後台主程式。
- _internal：程式封裝的 Python、Tk/Tcl 與其他執行期元件，請完整保留。
- tea_data.json：網站內容、商品、分類與圖片資料的主要來源。修改前建議備份。
- site：由後台產生的靜態網站檔案；不要單獨用舊版覆蓋。
- cloudflare_pages.json：Cloudflare Pages 帳戶／專案發布設定，含 API Token。
- 使用說明.txt：快速操作指引。
- README.txt：本完整說明。
- upload_log.txt、deploy_status.json：上傳紀錄與最近一次發布狀態，程式會更新。

整包複製後可以重新命名資料夾或放到其他磁碟；執行檔會以自身所在資料夾定位設定、資料與 site，不依賴原桌面路徑。要跨電腦搬移，請一併複製上述整個資料夾，並保留 cloudflare_pages.json。

三、網站與上傳方式
本網站是 Cloudflare Pages 靜態網站。後台以 tea_data.json 為資料來源，產生 site 內的 HTML、CSS、JavaScript、圖片和 data.json，再透過 Cloudflare Pages API 發布。這個流程不使用 FTP，也不需要另外購買網站主機。

網站資訊頁包含品牌名稱、標語、首頁文字、Facebook、電話、地址、Email、LINE 官方 ID、營業時間、頁尾文字與網站小圖示。修改後按「儲存並產生前台」；若啟用自動發布，儲存後便會部署。商品、分類與精選資料的儲存也會依自動發布設定更新網站。

目前聯絡資訊欄位會顯示電話、市話、地址、Email、LINE ID、營業時間與 Facebook。電話連結會撥打手機號碼，Email 連結會開啟郵件程式。

四、Cloudflare 設定檔與安全
cloudflare_pages.json 必須與 tea_admin.exe 放在同一個資料夾。程式會讀取其中的帳戶 ID、Pages 專案名稱、API Token、正式網址與部署分支。客戶版已附設定檔，正常情況下不必再手動建立。

此檔案含有可發布正式網站的 API Token，等同部署憑證：只交給受信任且有權維護網站的人；不要上傳公開網路、寄到不安全的群組或放在任何人可讀取的共用資料夾。若 USB 或設定檔遺失、外流或不再交由該使用者維護，請在 Cloudflare 撤銷舊 Token 並建立新的 Token，再更新此設定檔。

本專案上傳 GitHub 時，cloudflare_pages.json 已被 .gitignore 排除，不會進入版本控制；儲存庫僅保留不含憑證的 cloudflare_pages.example.json 作為欄位範本。使用時請自行複製為 cloudflare_pages.json 並填入實際值。

五、備份與圖片
- 修改前先備份整個交付資料夾，至少保留 tea_data.json 與 site\assets。
- 商品圖片請由後台選擇；程式會將所選圖片複製到網站資產資料夾。不要在檔案總管任意改名或刪除已被商品使用的圖片。
- site 是輸出結果；主要內容請在後台編輯，不建議手動修改 site 內產生的檔案。
- 若更換電腦，請先把整個資料夾複製到新電腦，再從新位置啟動 tea_admin.exe。不要只將 exe 移出來。

六、常見問題
1. 找不到 cloudflare_pages.json：確認設定檔位於 tea_admin.exe 旁邊，且檔名正確。
2. 上傳失敗：確認新電腦可連線網際網路、Cloudflare Token 仍有效，並查看 upload_log.txt 的錯誤訊息。
3. 網站未更新：先確認後台發布狀態，再重新整理正式網址；也可查看網站的 https://yuanlintea.com.tw/data.json 是否反映新資料。
4. 程式無法啟動或顯示缺少檔案：確認整個交付資料夾已複製完成，尤其是 _internal、site、tea_data.json 和 cloudflare_pages.json。
5. 不要同時用不同資料夾的舊版後台編輯同一份網站資料，否則舊版資料可能覆蓋新版修改。

適用於 Windows 電腦。上傳需要可連線 Cloudflare 的網際網路，以及有效的 cloudflare_pages.json 設定。

七、移機與發布驗證（2026-10-20）
本次將完整版複製到另一個暫存資料夾後啟動 tea_admin.exe，後台正常開啟；執行中的 Python、Tcl/Tk 元件皆由該副本的 _internal 載入。以該副本的 cloudflare_pages.json 驗證 Cloudflare Pages 專案，並成功發布該副本的 site（本次 0 個檔案需更新、18 個檔案略過，表示遠端內容已相同）。

此為同一台 Windows 電腦上的異路徑隔離測試，不能代替在每一台實體電腦上的測試。電腦仍需可正常執行 Windows 桌面程式、可連線網際網路，且保留完整交付資料夾與有效的 Cloudflare 設定檔。
