/* eslint-disable unicorn/prefer-export-from */
import alignment from '@taqwim/plugins/docblock/alignment';
import required from '@taqwim/plugins/docblock/required';
import summary from '@taqwim/plugins/docblock/summary';
import paramTag from '@taqwim/plugins/docblock/param-tag';
import spacing from '@taqwim/plugins/docblock/spacing';

const docblock = [alignment, required, summary, paramTag, spacing];
export { alignment, required, summary, paramTag, docblock, spacing };