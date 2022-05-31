// Takes in a styles from a css module import.
// Returns a lambda that takes in a variable number of strings which are the classes in the style.
const StylesMerger = (styles: { readonly [key: string]: string }) => {
  return (...list: string[]): string => {
    return list.map((x) => styles[x]).join(" ");
  };
};

/* Example Usage:
import styles from "../styles/Settings.module.css";

...

const styler = StylesMerger(styles);
<div className={styles("style1", "style2")}>I am styled!</div>
*/

export default StylesMerger;
