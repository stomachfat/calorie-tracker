module ApplicationHelper
  def react_component(component_name, **props)
    content_tag(
      "div",
      data: {
        react_component: component_name,
        props: props.to_json,
      }
    ) { "" }
  end
end
