import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

bad_end = '''                        </table>
                        )}
                        </>
                      )}
                      </table>
                    </div>'''

good_end = '''                        </table>
                        )}
                    </div>'''

content = content.replace(bad_end, good_end)

with open('src/pages/Investors.tsx', 'w') as f:
    f.write(content)
