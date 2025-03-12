export default [
  {
    _id: {
      $oid: "67b0f16ae4dacd8705e77331",
    },
    name: "Kyle Davids",
    dateOfBirth: {
      $date: "1988-11-21T00:00:00.000Z",
    },
    nhsNumber: "36272839293982",
    address: "9 Sydney Street, DE14 2QX",
    phoneNumber: "07653573041",
    emergencyContact: {
      name: "Henry Manis",
      relationship: "Dad",
      phoneNumber: "07234576887",
    },
    createdAt: {
      $date: "2025-02-15T19:56:26.148Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "67b0f234e4dacd8705e77335",
    },
    name: "John Doe",
    dateOfBirth: {
      $date: "1998-12-23T00:00:00.000Z",
    },
    nhsNumber: "36272839293009",
    address: "9 Sydney Street, DE14 2QX",
    phoneNumber: "07642487675",
    emergencyContact: {
      name: "Jane Simpson",
      relationship: "Adoptive Mum",
      phoneNumber: "073658972378",
    },
    createdAt: {
      $date: "2025-02-15T19:59:48.135Z",
    },
    __v: 0,
    group: {
      $oid: "67bce2a2a2b113be7c2f54e1",
    },
  },
  {
    _id: {
      $oid: "67c97ba446f9974fd57f4476",
    },
    name: "Peter Oshea",
    dateOfBirth: {
      $date: "2000-02-10T00:00:00.000Z",
    },
    nhsNumber: "36272839293008",
    address: "100a high street",
    phoneNumber: "07730846910",
    emergencyContact: {
      name: "peterson",
      relationship: "Sister",
      phoneNumber: "07735086913",
    },
    group: {
      $oid: "67bce2a2a2b113be7c2f54e1",
    },
    createdAt: {
      $date: "2025-03-06T10:40:36.436Z",
    },
    __v: 0,
  },
];
