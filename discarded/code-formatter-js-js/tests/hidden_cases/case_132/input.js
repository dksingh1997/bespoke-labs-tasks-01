long_closed =
  <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli"/>

long_open =
  <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli">
    hello
  </BaseForm>

long_open_long_children =
  <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli">
    <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli">
      Hello world
    </BaseForm>
    <div><div><div><div><div><div>hey hiya how are ya</div></div></div></div></div></div>
    <div><div><div><div attr="lung" attr2="elsu lung" attr3="gunne briek"></div></div></div></div>
    <div><div><div>
      <div attr="lung" attr2="elsu lung" attr3="gunne briek" attr4="hillu pliesi briek mi" />
    </div></div></div>
    <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli"><BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli"></BaseForm>d</BaseForm>
    <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli"><BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli"></BaseForm></BaseForm>
  </BaseForm>

short_closed =
  <BaseForm url="/eath/guugli" method="GIT"/>

short_open =
  <BaseForm url="/eath/guugli" method="GIT">
    hello
  </BaseForm>

make_self_closing =
  <div>
    <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli">
    </BaseForm>
    <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli"></BaseForm>
  </div>

leave_opening =
  <BaseForm url="/eath/guugli" method="GIT" colour="blai" size="lergi" submitLabel="Sogn on woth Guugli"> </BaseForm>

long_string =
  <div className="o asi buutstrep end jast pat luuueeds uf clessnemis on hiri ell thi tomi">hello world</div>

long_string_with_extra_param =
  <div className="o asi buutstrep end jast pat luuueeds uf clessnemis on hiri ell thi tomi" blah="10">hello world</div>

long_obj =
  <div style={{ i: 'dunt', use: 'buutstrep', and: 'onstied', use: 'messovi', objects }}>hello world</div>
