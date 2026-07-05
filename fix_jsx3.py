import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

# I will find this precise block and fix it.
bad_block = '''                        </tbody>
                      {historyBidsApps.length > 0 && (
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6">'''

good_block = '''                        </tbody>
                      </table>
                      {historyBidsApps.length > 0 && (
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6 border-t border-kite-border">'''

content = content.replace(bad_block, good_block)

# And fix the ending tags:
bad_end = '''                        </table>
                        )}
                        </>
                      )}
                      </table>
                    </div>'''

good_end = '''                        </table>
                        )}
                      </div>
                    </div>'''
# wait, if I use good_end, does it close correctly?
# The wrapper is: <div className="hidden md:block overflow-x-auto border-b border-kite-border">
# So the end should just be `</div> </div>` without the extra `</table>`
# Wait, let's verify if `{historyBidsApps.length > 0 && (` was the only ternary.
