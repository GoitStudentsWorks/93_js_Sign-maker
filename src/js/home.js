import { FoodBoutiqueAPI } from './food-api';
import { Storage, ShopStorage } from './local-storage-api';
import { renderProductList } from './render-product-list';
import { renderPopularProd, renderDiscountProd } from './aside';
import { initPagination } from './pagination/pagination-handler';
import {
  initKeywordInFilter,
  initCategoryInFilter,
  initSelectedCtgOption,
  initSortInFilter,
  initSelectedSortOption,
} from './filter';
import debounce from 'debounce';

const FILTER_STORAGE = 'filter-storage';
const CATEGORY_STORAGE = 'category-storage';
const PRODUCT_STORAGE = 'product-storage';
const POPULARITY_STORAGE = 'popularity-storage';
const DISCOUNT_STORAGE = 'discount-storage';
const SHOP_STORAGE = 'shop-storage';

const INIT_FILTER_PARAMS = {
  keyword: null,
  category: null,
  byABC: true,
  page: 1,
  limit: getPageLimit(),
};

const productListRef = document.querySelector('.product-card-list');
const popularProductListRef = document.querySelector('.popular-list');
const discountProductListRef = document.querySelector('.discount-list');
const contentWrapperRef = document.querySelector('.content-wrapper');
const spanCartRef = document.querySelector('.js-header-navSpan');
const categoryListRef = document.querySelector('.js-category');

const foodBoutique = new FoodBoutiqueAPI();
const filterStorage = new Storage(FILTER_STORAGE);
const categoryStorage = new Storage(CATEGORY_STORAGE);
const productStorage = new Storage(PRODUCT_STORAGE);
const popularityStorage = new Storage(POPULARITY_STORAGE);
const discountStorage = new Storage(DISCOUNT_STORAGE);
const shopStorage = new ShopStorage(SHOP_STORAGE);

// let allItem;

contentWrapperRef.addEventListener('click', onButtonCartClick);
window.addEventListener('resize', debounce(onWindowResize, 250));

if (!filterStorage.getValue()) {
  filterStorage.setValue(INIT_FILTER_PARAMS);
} else {
  if (filterStorage.getValue().limit !== getPageLimit()) {
    setPageLimit();
  }
}

const filterParams = filterStorage.getValue();
initLoad(filterParams);

async function onWindowResize() {
  // console.log('resize');
  if (filterStorage.getValue().limit === getPageLimit()) {
    return;
  }
  setPageLimit();
  await getProducts(filterStorage.getValue());
  initPagination();
}

function getPageLimit() {
  if (window.matchMedia('(max-width: 767px)').matches) {
    return 6;
  }

  if (
    window.matchMedia('(min-width: 768px)' && '(max-width: 1439px)').matches
  ) {
    return 8;
  }

  if (window.matchMedia('(min-width: 1440px)').matches) {
    return 9;
  }
}

function setPageLimit() {
  filterStorage.setValue({
    ...filterStorage.getValue(),
    page: 1,
    limit: getPageLimit(),
  });
}

async function initLoad(filterParams) {
  await Promise.allSettled([
    getCategories(),
    getProducts(filterParams),
    getPopularProducts(),
    getDiscountedProducts(),
  ]);
  initKeywordInFilter();
  initCategoryInFilter();
  initSelectedCtgOption();
  initSortInFilter();
  initSelectedSortOption();
  initPagination();
  // allItem = addListenerToAllCard();
  // filterHandler();
  setCartStateForAllProducts();
}

changeQuantityOrderedInBasket(shopStorage.getAllProducts());

async function getCategories() {
  try {
    // loader show
    const productCategories = await foodBoutique.getProductCategories();
    categoryStorage.setValue(productCategories);
    // fillCategoryList(categoryListRef, categoryStorage.getValue());
    // categoryStorage.getValue();
  } catch (error) {
    console.log(error);
  } finally {
    //  loader hide
  }
}

export async function getProducts(filterParams) {
  try {
    // loader show
    productListRef.classList.add('js-loader');
    const products = await foodBoutique.getProducts(filterParams);
    productStorage.setValue(products);

    // if (!filterStorage.getValue()) {
    //   filterStorage.setValue(filterParams);
    // }
    renderProductList(productListRef, productStorage.getValue().results);
    setCartStateForAllProducts();
  } catch (error) {
    console.log(error);
  } finally {
    productListRef.classList.remove('js-loader');
  }
}

async function getPopularProducts() {
  try {
    // loader show
    popularProductListRef.classList.add('js-loader');
    const popularProducts = await foodBoutique.getPopularProducts();
    popularityStorage.setValue(popularProducts);
    renderPopularProd(popularProductListRef, popularityStorage.getValue());
  } catch (error) {
    console.log(error);
  } finally {
    //  loader hide
    popularProductListRef.classList.remove('js-loader');
  }
}

async function getDiscountedProducts() {
  try {
    // loader show
    discountProductListRef.classList.add('js-loader');
    const discountedProducts = await foodBoutique.getDiscountedProducts();
    discountStorage.setValue(discountedProducts);
    renderDiscountProd(discountProductListRef, discountStorage.getValue());
  } catch (error) {
    console.log(error);
  } finally {
    //  loader hide
    discountProductListRef.classList.remove('js-loader');
  }
}
//-----------filter--------------------------------------------------------------------------

// function addListenerToAllCard() {
//   const li = document.querySelectorAll('.js-card-item');

//   getOverItems(li);
//   return li;
// }

// function getOverItems(arrNodeList) {
//   const arr = [...arrNodeList];

//   return arr.filter(item => {
//     const arrFromShop = shopStorage.getAllProducts();

//     return arrFromShop.map(obj => {
//       if (item.dataset.id === obj._id) {
//         // console.log(item);
//         const btnItemRef = document.querySelectorAll(
//           `[data-id="${obj._id}"] .js-add-btn`
//         );
//         // console.log(btnItemRef);

//         if (typeof btnItemRef === 'object') {
//           [...btnItemRef].map(el => {
//             if (el.classList.contains('popular-btn')) {
//               el.style.backgroundColor = '#6d8434';
//             }
//             return el.classList.add('is-added');
//           });
//         } else {
//           if (btnItemRef.classList.contains('popular-btn')) {
//             btnItemRef.style.backgroundColor = '#6d8434';
//           }
//           btnItemRef.classList.add('is-added');
//         }
//       }
//     });
//   });
// }

// function onButtonCartClick(e) {
//   if (!e.target.closest('.js-add-btn')) return;
//   /////////////////////////////////////////////////////

//   const item = e.target.closest('li');
//   const idCard = item.dataset.id;
//   const isNewIDinBasket = checkNewIDinBasket(idCard);

//   if (isNewIDinBasket) return;

//   e.target.closest('button').classList.add('is-added');

//   if (e.target.closest('.popular-btn')) {
//     e.target.closest('.popular-btn').style.backgroundColor = '#6d8434';
//   }

//   const arrProdStor = productStorage.getValue().results;
//   const arrPopStor = popularityStorage.getValue();
//   const arrDiscStor = discountStorage.getValue();

//   const objFromProdStor = objFromLocStor(arrProdStor, idCard);
//   const objFromPopStor = objFromLocStor(arrPopStor, idCard);
//   const objFromDiscStor = objFromLocStor(arrDiscStor, idCard);

//   switch ('object') {
//     case typeof objFromProdStor:
//       shopStorage.setProduct(objFromProdStor);
//       break;
//     case typeof objFromPopStor:
//       shopStorage.setProduct(objFromPopStor);
//       break;
//     case typeof objFromDiscStor:
//       shopStorage.setProduct(objFromDiscStor);
//       break;
//     default:
//       alert('Нет таких значений');
//   }

//   changeButtonsOnClick(e, idCard);
//   changeQuantityOrderedInBasket(shopStorage.getAllProducts());

//   function getOverItems(cardId, arrNodeList) {
//     const arr = [...arrNodeList];
//     // const newArrById = arr.filter(item=>{
//     //   return item.dataset.id === cardId
//     // })
//     return arr.forEach(item => {
//       if (item.dataset.id === cardId) {
//         // console.dir(item.children);
//         item.classList.add('is-added');
//       }
//     });
//     // console.log(newArrById);
//   }

//   getOverItems(idCard, allItem);
// }

// function checkNewIDinBasket(id) {
//   const shopStorageProducts = shopStorage.getAllProducts();
//   if (shopStorageProducts === null) return;
//   return shopStorageProducts.some(el => el._id === id);
// }

// function objFromLocStor(arrDataLocalStorage, idCard) {
//   const obj = arrDataLocalStorage.find(el => el._id === idCard);
//   return obj;
// }

// function changeButtonsOnClick(eventFromHandler, cardId) {
//   const productList = document.querySelector('.product-card-list');
//   const popularList = document.querySelector('.popular-list');
//   const discountList = document.querySelector('.discount-list');

//   const arrProduct = [...productList.children];
//   const arrDiscount = [...discountList.children];
//   const arrPopular = [...popularList.children];

//   if (eventFromHandler.target.closest('.products-wrapper')) {
//     arrPopular.forEach(el => {
//       if (el.dataset.id === cardId) {
//         const elBtnRef = document.querySelector(
//           `.popular-list [data-id="${el.dataset.id}"] .js-add-btn`
//         );
//         elBtnRef.classList.add('is-added');
//         elBtnRef.style.backgroundColor = '#6d8434';
//       }
//     });

//     arrDiscount.forEach(el => {
//       if (el.dataset.id === cardId) {
//         const elBtnRef = document.querySelector(
//           `.discount-list [data-id="${el.dataset.id}"] .js-add-btn`
//         );
//         elBtnRef.classList.add('is-added');
//       }
//     });
//   }

//   if (eventFromHandler.target.closest('.popular-list')) {
//     arrProduct.forEach(el => {
//       if (el.dataset.id === cardId) {
//         const elBtnRef = document.querySelector(
//           `.product-card-list [data-id="${el.dataset.id}"] .js-add-btn`
//         );
//         elBtnRef.classList.add('is-added');
//       }
//     });

//     arrDiscount.forEach(el => {
//       if (el.dataset.id === cardId) {
//         const elBtnRef = document.querySelector(
//           `.discount-list [data-id="${el.dataset.id}"] .js-add-btn`
//         );
//         console.log(elBtnRef);
//         elBtnRef.classList.add('is-added');
//       }
//     });
//   }

//   if (eventFromHandler.target.closest('.discount-list')) {
//     arrPopular.forEach(el => {
//       if (el.dataset.id === cardId) {
//         const elBtnRef = document.querySelector(
//           `.popular-list [data-id="${el.dataset.id}"] .js-add-btn`
//         );
//         elBtnRef.classList.add('is-added');
//         elBtnRef.style.backgroundColor = '#6d8434';
//       }
//     });

//     arrProduct.forEach(el => {
//       if (el.dataset.id === cardId) {
//         const elBtnRef = document.querySelector(
//           `.product-card-list [data-id="${el.dataset.id}"] .js-add-btn`
//         );
//         elBtnRef.classList.add('is-added');
//       }
//     });
//   }
// }

// ============dima edition==========================================================================

const LISTS_TO_INSPECT = [
  productListRef,
  popularProductListRef,
  discountProductListRef,
];

const PRODUCT_STORAGE_LIST_ID = 'product';
const POPULARITY_STORAGE_LIST_ID = 'popular';
const DISCOUNT_STORAGE_LIST_ID = 'discount';

const IN_CART = true;
const NOT_IN_CART = false;

const IS_ADDED_CLASS = 'is-added';
const BTN_CART_CLASS = 'js-add-btn';
const CARD_LI_CLASS = 'js-card-item';

export function setCartStateForAllProducts() {
  if (!shopStorage || !shopStorage.getAllProducts().length) {
    return;
  }
  shopStorage
    .getAllProducts()
    .map(({ _id }) => setCartStateForOneProduct(_id, IN_CART));
}

export function setCartStateForOneProduct(prodId, state) {
  const buttons = LISTS_TO_INSPECT.map(list => getButtonById(list, prodId));
  // Установка состояния кнопок
  changeButtonsState(buttons, state);
}

function getButtonById(list, prodId) {
  return list.querySelector(`[data-id="${prodId}"]`)
    ? list.querySelector(`[data-id="${prodId}"]`).querySelector('.js-add-btn')
    : null;
}

function changeButtonsState(buttons, state) {
  buttons.map(btn => {
    if (!btn) {
      return;
    }
    if (state === IN_CART) {
      btn.classList.add(IS_ADDED_CLASS);
      return;
    }
    if (!state) {
      btn.classList.remove(IS_ADDED_CLASS);
      return;
    }
  });
}

function onButtonCartClick(event) {
  const { target } = event;
  // console.dir(target.closest(`.${BTN_CART_CLASS}`));
  if (
    !(
      target.classList.contains(BTN_CART_CLASS) ||
      target.parentNode.classList.contains(BTN_CART_CLASS) ||
      target.closest(`.${BTN_CART_CLASS}`)
    ) ||
    target.classList.contains(IS_ADDED_CLASS) ||
    target.parentNode.classList.contains(IS_ADDED_CLASS) ||
    target.closest(`.${IS_ADDED_CLASS}`)
  ) {
    return;
  }

  const prodId = target.closest(`.${CARD_LI_CLASS}`).dataset.id;
  const localStorageDataId = target.closest(`ul`).dataset.lsName;
  // console.log(localStorageDataId);

  setCartStateForOneProduct(prodId, IN_CART);
  addProductToStorage(localStorageDataId, prodId);
}

function getProductFromStorageArr(prodDataArr, prodId) {
  const obj = prodDataArr.find(el => el._id === prodId);
  return obj;
}

function addProductToStorage(localStorageDataId, prodId) {
  let product = {};

  switch (localStorageDataId) {
    case PRODUCT_STORAGE_LIST_ID: {
      product = getProductFromStorageArr(
        productStorage.getValue().results,
        prodId
      );
      break;
    }
    case POPULARITY_STORAGE_LIST_ID: {
      product = getProductFromStorageArr(popularityStorage.getValue(), prodId);
      break;
    }
    case DISCOUNT_STORAGE_LIST_ID: {
      product = getProductFromStorageArr(discountStorage.getValue(), prodId);
      break;
    }
    default: {
      product = {};
    }
  }

  shopStorage.setProduct(product);
  changeQuantityOrderedInBasket(shopStorage.getAllProducts());
}

export function changeQuantityOrderedInBasket(arrFromLocStor) {
  let quantityOrdered = arrFromLocStor.length;
  spanCartRef.textContent = quantityOrdered;
}
