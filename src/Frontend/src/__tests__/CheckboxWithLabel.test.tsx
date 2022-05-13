import { CheckboxWithLabel } from "components/BookList/CheckboxWithLabel";
import React from "react";
import renderer from "react-test-renderer";

it('CheckboxWithLabel renders testLabel', () => {
    const component = renderer.create(<CheckboxWithLabel label="testLabel" />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});