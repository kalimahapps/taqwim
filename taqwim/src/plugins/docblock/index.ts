/* eslint-disable unicorn/prefer-export-from */
import alignment from '@taqwim/plugins/docblock/alignment';
import required from '@taqwim/plugins/docblock/required';
import summary from '@taqwim/plugins/docblock/summary';

const docblock = [alignment, required, summary];
export { alignment, required, summary, docblock };