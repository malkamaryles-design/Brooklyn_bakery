const AUTH_ERRORS = {
  MISSING_FIELDS: {
    code: 'AUTH_001',
    status: 400,
    message: 'שם, אימייל וסיסמה הם שדות חובה',
  },
  EMAIL_EXISTS: {
    code: 'AUTH_002',
    status: 400,
    message: 'כתובת האימייל כבר רשומה במערכת',
  },
  INVALID_CREDENTIALS: {
    code: 'AUTH_003',
    status: 401,
    message: 'אימייל או סיסמה שגויים',
  },
  NO_TOKEN: {
    code: 'AUTH_004',
    status: 401,
    message: 'נדרשת התחברות — לא נמצא טוקן',
  },
  INVALID_TOKEN: {
    code: 'AUTH_005',
    status: 401,
    message: 'הטוקן לא תקין או פג תוקף',
  },
  FORBIDDEN: {
    code: 'AUTH_006',
    status: 403,
    message: 'אין הרשאה לפעולה זו — דורש אדמין',
  },
  USER_NOT_FOUND: {
    code: 'AUTH_007',
    status: 404,
    message: 'המשתמש לא נמצא',
  },
};
const PRODUCT_ERRORS = {
  NOT_FOUND: {
    code: 'PROD_001',
    status: 404,
    message: 'המוצר לא נמצא',
  },
  INVALID_INPUT: {
    code: 'PROD_002',
    status: 400,
    message: 'מזהה מוצר או כמות לא תקינים',
  },
};
const CART_ERRORS = {
  ITEM_NOT_FOUND: {
    code: 'CART_001',
    status: 404,
    message: 'הפריט לא נמצא בעגלה',
  },
  INVALID_QUANTITY: {
    code: 'CART_002',
    status: 400,
    message: 'הכמות חייבת להיות לפחות 1',
  },
  EMPTY_CART: {
    code: 'CART_003',
    status: 400,
    message: 'העגלה ריקה — לא ניתן לבצע הזמנה',
  },
};
const ORDER_ERRORS = {
  MISSING_CUSTOMER: {
    code: 'ORD_001',
    status: 400,
    message: 'שם, אימייל וטלפון הם שדות חובה',
  },
  INVALID_DELIVERY: {
    code: 'ORD_002',
    status: 400,
    message: 'סוג משלוח לא תקין',
  },
  MISSING_ADDRESS: {
    code: 'ORD_003',
    status: 400,
    message: 'כתובת משלוח נדרשת',
  },
  INVALID_STATUS: {
    code: 'ORD_004',
    status: 400,
    message: 'סטטוס לא תקין',
  },
  NOT_FOUND: {
    code: 'ORD_005',
    status: 404,
    message: 'ההזמנה לא נמצאה',
  },
};
const GENERAL_ERRORS = {
  SERVER_ERROR: {
    code: 'GEN_001',
    status: 500,
    message: 'שגיאת שרת — נסה שוב מאוחר יותר',
  },
  NETWORK_ERROR: {
    code: 'GEN_002',
    status: 0,
    message: 'בעיית תקשורת — בדוק חיבור אינטרנט',
  },
};
const sendError = (res, errorDef) =>
  res.status(errorDef.status).json({
    error: errorDef.message,
    code: errorDef.code,
  });
module.exports = {
  AUTH_ERRORS,
  PRODUCT_ERRORS,
  CART_ERRORS,
  ORDER_ERRORS,
  GENERAL_ERRORS,
  sendError,
};