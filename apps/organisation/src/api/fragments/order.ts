import { gql } from '@apollo/client';

export const ORDER_DETAILS_FRAGMENT = gql`
  fragment OrderDetails on Order {
    _id
    orderNo
    tableNo
    roomNo
    email
    phone
    currency
    name
    type
    status
    payment
    subTotal
    serviceTax
    total
    discount
    paymentType
    createdAt
    invoiceUrl
    edocNeedsVerification
    edocStatus
    edocErrorMessage
    items {
      _id
      name
      qty
      discount
      price
      note
      finalPrice
      comboProducts {
        _id
        name
        type
        price
        options {
          _id
          name
          price
          type
        }
      }
      extras {
        groupName
        products {
          _id
          name
          price
        }
      }
    }
  }
`;
