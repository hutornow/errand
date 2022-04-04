import 'dart:convert';

import 'package:bloc/bloc.dart';
import 'package:tasker_app/bloc/task/task_cubit.dart';
import 'package:tasker_app/data/models/task.dart';
import 'package:tasker_app/data/services/task/repository.dart';

part 'add_task_state.dart';

class AddTaskCubit extends Cubit<AddTaskState> {
  final TaskRepository repository;
  final TaskCubit taskCubit;
  AddTaskCubit(this.repository, this.taskCubit)
      : super(AddTaskInitial(task: Task(date: DateTime.now())));

  void updateTitle(String title) {
    final currentState = state;
    if (currentState is AddingTaskDataChanged ||
        currentState is AddTaskInitial) {
      emit(AddingTaskDataChanged(
          task: currentState.task.copyWith(title: title)));
    }
  }

  void updateProject(int project_id) {
    final currentState = state;
    if (currentState is AddingTaskDataChanged ||
        currentState is AddTaskInitial) {
      emit(AddingTaskDataChanged(
          task: currentState.task.copyWith(project_id: project_id)));
    }
  }

  void updateDescription(String description) {
    final currentState = state;
    if (currentState is AddingTaskDataChanged ||
        currentState is AddTaskInitial) {
      emit(AddingTaskDataChanged(
          task: currentState.task.copyWith(description: description)));
    }
  }

  void addTask(Task task) {
    final currentState = state;
    emit(AddingTask());
    repository.addTask(task).then((response) {
      if (response.statusCode == 200) {
        var newTask = jsonDecode(response.body);
        emit(AddingTaskSuccess());
        emit(AddTaskInitial());
        taskCubit.addTaskToState(Task.fromJson(newTask));
      } else if (response.statusCode == 400) {
        emit(AddingTaskError(task: currentState.task));
      }
    });
  }
}