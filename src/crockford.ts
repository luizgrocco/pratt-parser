// const prototype_token = {
//   nud: function () {
//     this.error("Undefined.");
//   },
//   led: function (left: any) {
//     this.error("Missing operator.");
//   },
//   error: function (message: string) {
//     console.log(message);
//   },
//   leftBindingPower: 0,
// };

// type Symbol = typeof prototype_token & { id: string; value: string };

// const symbol_table: Record<string, Symbol> = {};

// function createSymbol(id: string, bindingPower: number = 0): Symbol {
//   let symbol = symbol_table[id];

//   if (symbol) {
//     if (bindingPower >= symbol.leftBindingPower) {
//       symbol.leftBindingPower = bindingPower;
//     }
//   } else {
//     symbol = {
//       ...prototype_token,
//       id,
//       value: id,
//       leftBindingPower: bindingPower,
//     };
//     symbol_table[id] = symbol;
//   }

//   return symbol;
// }

// createSymbol(":");
// createSymbol(";");
// createSymbol(",");
// createSymbol(")");
// createSymbol("]");
// createSymbol("}");
// createSymbol("else");
// createSymbol("(end)");
// createSymbol("(word)");

// type TreeNode = {
//   id: string;
//   // This is really the "type", should be an enum of all the possible types of elements in the final tree
//   arity: string;
//   left?: TreeNode;
//   right?: TreeNode;
// };

// function a() {
//   this.first = "lala";
//   this.second = "lele";
//   this.arity = "binary";
//   return this;
// }

// const b = { led: () => {} };
// b.led = a;
