#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/MorphletSpec/EventEmitters.h>
#include <react/renderer/components/MorphletSpec/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/StateData.h>

namespace facebook::react {

JSI_EXPORT extern const char MorphletContainerViewComponentName[];


class MorphletContainerViewShadowNode final : public ConcreteViewShadowNode<
                                                  MorphletContainerViewComponentName,
                                                  MorphletContainerViewProps,
                                                  MorphletContainerViewEventEmitter,
                                                  StateData> {
 public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;
  static ShadowNodeTraits BaseTraits() {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    traits.set(ShadowNodeTraits::Trait::RootNodeKind);
    traits.set(ShadowNodeTraits::Trait::Unstable_uncullableView);
    return traits;
  }
};

} // namespace facebook::react
