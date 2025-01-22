// 全域變數，存放從 Google 試算表 CSV 解析後的資料
let allData = [];

// 在網頁載入完成時，開始抓取 CSV 資料
window.addEventListener('DOMContentLoaded', () => {
  fetchData();
});

/**
 * 從 Google Sheet 已「發布」的 CSV 連結抓取資料
 */
function fetchData() {
  // 這裡直接替換為你給的 CSV URL
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqcr7zoSqAYAvBlYdPJ1SE1COFJ-ZSg71ux2D-XSgv-EtBoUkV_9KdfH713u8P-94yRDx-17cvl7Ov/pub?gid=0&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvString => {
      // 解析 CSV 字串並存到 allData
      allData = parseCSV(csvString);
      // 動態填充下拉選單選項
      populateSelectOptions(allData);
      // 預設先顯示全部資料
      renderResults(allData);
    })
    .catch(error => {
      console.error('抓取 CSV 資料時發生錯誤：', error);
    });
}

/**
 * 解析 CSV 字串：假設第一列是標題，後面是資料
 * 這裡示範最基本的手工拆分，可改用 PapaParse 等工具處理更複雜的情形
 */
function parseCSV(csvString) {
  // 先按行分割
  const rows = csvString.trim().split('\n');
  // 第一行為標題
  const headers = rows[0].split(',');

  // 從第二行開始組成物件
  return rows.slice(1).map(row => {
    const values = row.split(',');
    let obj = {};
    headers.forEach((header, index) => {
      // 去除可能的空白
      obj[header.trim()] = values[index] ? values[index].trim() : '';
    });
    return obj;
  });
}

/**
 * 將四個欄位（品牌、商品、分類、網紅）的所有不重複值
 * 塞到對應的下拉選單裡
 */
function populateSelectOptions(data) {
  const brandSelect = document.getElementById('brandSelect');
  const productSelect = document.getElementById('productSelect');
  const categorySelect = document.getElementById('categorySelect');
  const influencerSelect = document.getElementById('influencerSelect');

  // 使用 Set 來儲存不重複的值
  const brands = new Set();
  const products = new Set();
  const categories = new Set();
  const influencers = new Set();

  data.forEach(item => {
    // 注意欄位名稱需與 CSV 標題一致
    brands.add(item["品牌"]);
    products.add(item["商品"]);
    categories.add(item["分類"]);
    influencers.add(item["網紅"]);
  });

  // 將 Set 的值動態產生 <option>
  function addOptionsToSelect(selectElement, itemsSet) {
    itemsSet.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      selectElement.appendChild(option);
    });
  }

  addOptionsToSelect(brandSelect, brands);
  addOptionsToSelect(productSelect, products);
  addOptionsToSelect(categorySelect, categories);
  addOptionsToSelect(influencerSelect, influencers);

  // 當任一下拉選單改變時，執行 filterData()
  brandSelect.addEventListener('change', filterData);
  productSelect.addEventListener('change', filterData);
  categorySelect.addEventListener('change', filterData);
  influencerSelect.addEventListener('change', filterData);
}

/**
 * 根據當前下拉選單的選取值，篩選 allData
 */
function filterData() {
  const selectedBrand = document.getElementById('brandSelect').value;
  const selectedProduct = document.getElementById('productSelect').value;
  const selectedCategory = document.getElementById('categorySelect').value;
  const selectedInfluencer = document.getElementById('influencerSelect').value;

  // 下拉選單的 value 為空("")時，就代表「不篩選」
  const filtered = allData.filter(row => {
    const brandMatch = !selectedBrand || row["品牌"] === selectedBrand;
    const productMatch = !selectedProduct || row["商品"] === selectedProduct;
    const categoryMatch = !selectedCategory || row["分類"] === selectedCategory;
    const influencerMatch = !selectedInfluencer || row["網紅"] === selectedInfluencer;

    return brandMatch && productMatch && categoryMatch && influencerMatch;
  });

  renderResults(filtered);
}

/**
 * 將過濾後的資料渲染到網頁
 */
function renderResults(data) {
  const resultsDiv = document.getElementById('results');
  // 清空舊內容
  resultsDiv.innerHTML = '';

  if (data.length === 0) {
    resultsDiv.textContent = '沒有符合的資料';
    return;
  }

  data.forEach(row => {
    const p = document.createElement('p');
    // 依照你想顯示的欄位動態組字串
    p.textContent = `品牌：${row["品牌"]} | 商品：${row["商品"]} | 分類：${row["分類"]} | 網紅：${row["網紅"]} | 折扣碼：${row["折扣碼"]}`;
    resultsDiv.appendChild(p);
  });
}
